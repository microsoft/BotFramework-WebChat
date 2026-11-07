import { createReadonlyMap, type ReadWriteMap, type VersionedReadonlyMap } from 'botframework-webchat-store';
import type { LocalId } from '../property/LocalId';
import type {
  Activity,
  ActivityMapEntry,
  HowToGroupingId,
  HowToGroupingMapEntry,
  HowToGroupingMapPartEntry,
  LivestreamSessionId,
  LivestreamSessionMapEntry,
  LivestreamSessionMapEntryActivityEntry,
  SortedChatHistoryEntry,
  State
} from '../types';
import { getActivity } from './activityNode';
import { CONVERSATION_ID, type ActivitiesGraph } from './createActivitiesGraph';
import getSortedMessages, { type GetParts } from './getSortedMessages';
import { getBoolean, getIdentifier, getNumber, getParentId, hasType } from './private/nodeProperties';
import { getKnownFlat } from './private/flatParts';
import type { FlushResult } from './private/WorkingGraph';
import type { GetNode, GraphIdentifier, GraphNode } from './types';
import {
  DIRECT_LINE_ACTIVITY_TYPE,
  FINALIZED,
  HOW_TO_TYPE,
  LIVESTREAM_SESSION_TYPE,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from './vocabulary';

// Entries of unchanged nodes are reused: a node object only changes when the store stores a new version of it.
const activityMapEntryCache = new WeakMap<GraphNode, ActivityMapEntry>();
const sortedChatHistoryEntryCache = new WeakMap<GraphNode, SortedChatHistoryEntry>();

function getActivityMapEntry(node: GraphNode): ActivityMapEntry | undefined {
  const cachedEntry = activityMapEntryCache.get(node);

  if (cachedEntry) {
    return cachedEntry;
  }

  const activity = getActivity(node);

  if (!activity) {
    return undefined;
  }

  const entry: ActivityMapEntry = Object.freeze({
    activity,
    activityLocalId: node['@id'] satisfies string as LocalId,
    logicalTimestamp: getNumber(node, LOGICAL_TIMESTAMP),
    type: 'activity'
  });

  activityMapEntryCache.set(node, entry);

  return entry;
}

function getLivestreamSessionId(session: GraphNode): LivestreamSessionId {
  return (getIdentifier(session) ?? session['@id']) satisfies string as LivestreamSessionId;
}

function getHowToGroupingId(howTo: GraphNode): HowToGroupingId {
  return (getIdentifier(howTo) ?? howTo['@id']) satisfies string as HowToGroupingId;
}

/** The entry of a part of the conversation: an activity, a livestream session or a HowTo. */
function getSortedChatHistoryEntry(part: GraphNode): SortedChatHistoryEntry {
  const cachedEntry = sortedChatHistoryEntryCache.get(part);

  if (cachedEntry) {
    return cachedEntry;
  }

  const logicalTimestamp = getNumber(part, LOGICAL_TIMESTAMP);

  const entry: SortedChatHistoryEntry = Object.freeze(
    hasType(part, LIVESTREAM_SESSION_TYPE)
      ? { livestreamSessionId: getLivestreamSessionId(part), logicalTimestamp, type: 'livestream session' as const }
      : hasType(part, HOW_TO_TYPE)
        ? { howToGroupingId: getHowToGroupingId(part), logicalTimestamp, type: 'how to grouping' as const }
        : { activityLocalId: part['@id'] satisfies string as LocalId, logicalTimestamp, type: 'activity' as const }
  );

  sortedChatHistoryEntryCache.set(part, entry);

  return entry;
}

function toLivestreamSessionMapEntry(
  session: GraphNode,
  getNode: GetNode,
  getParts: GetParts
): LivestreamSessionMapEntry {
  const activities: LivestreamSessionMapEntryActivityEntry[] = [];

  getParts(session['@id']).forEach(revisionId => {
    const revision = getNode(revisionId);
    const entry = revision && getActivityMapEntry(revision);

    entry &&
      activities.push(
        Object.freeze({
          activityLocalId: entry.activityLocalId,
          logicalTimestamp: entry.logicalTimestamp,
          // The final revision has no sequence number.
          sequenceNumber: getNumber(revision, STREAM_SEQUENCE) ?? Infinity,
          type: 'activity'
        })
      );
  });

  return Object.freeze({
    activities: Object.freeze(activities),
    finalized: getBoolean(session, FINALIZED),
    logicalTimestamp: getNumber(session, LOGICAL_TIMESTAMP)
  });
}

function toHowToGroupingMapEntry(howTo: GraphNode, getNode: GetNode, getParts: GetParts): HowToGroupingMapEntry {
  const partList: HowToGroupingMapPartEntry[] = getParts(howTo['@id']).map(partId => {
    const part = getNode(partId);
    const position = getNumber(part, PART_POSITION);
    const logicalTimestamp = getNumber(part, LOGICAL_TIMESTAMP);

    return Object.freeze(
      part && hasType(part, LIVESTREAM_SESSION_TYPE)
        ? { livestreamSessionId: getLivestreamSessionId(part), logicalTimestamp, position, type: 'livestream session' }
        : { activityLocalId: partId satisfies string as LocalId, logicalTimestamp, position, type: 'activity' }
    );
  });

  return Object.freeze({ logicalTimestamp: getNumber(howTo, LOGICAL_TIMESTAMP), partList: Object.freeze(partList) });
}

type ActivityMaps = {
  readonly activityIdToLocalIdMap: ReadWriteMap<string, LocalId>;
  readonly activityMap: ReadWriteMap<LocalId, ActivityMapEntry>;
  readonly clientActivityIdToLocalIdMap: ReadWriteMap<string, LocalId>;
};

/** Replaces the entries of one activity node; a node outside of the tree (deleted) only removes them. */
function updateActivityMaps(
  { activityIdToLocalIdMap, activityMap, clientActivityIdToLocalIdMap }: ActivityMaps,
  previousEntry: ActivityMapEntry | undefined,
  node: GraphNode
): void {
  const activityLocalId = node['@id'] satisfies string as LocalId;

  if (previousEntry) {
    const { channelData, id } = previousEntry.activity;
    const clientActivityID = channelData?.clientActivityID;

    typeof id !== 'undefined' &&
      activityIdToLocalIdMap.get(id) === activityLocalId &&
      activityIdToLocalIdMap.delete(id);
    typeof clientActivityID !== 'undefined' &&
      clientActivityIdToLocalIdMap.get(clientActivityID) === activityLocalId &&
      clientActivityIdToLocalIdMap.delete(clientActivityID);
    activityMap.delete(activityLocalId);
  }

  const entry = getParentId(node) ? getActivityMapEntry(node) : undefined;

  if (entry) {
    const { activity } = entry;
    const clientActivityID = activity.channelData?.clientActivityID;

    typeof activity.id !== 'undefined' && activityIdToLocalIdMap.set(activity.id, activityLocalId);
    typeof clientActivityID !== 'undefined' && clientActivityIdToLocalIdMap.set(clientActivityID, activityLocalId);
    activityMap.set(activityLocalId, entry);
  }
}

/** Recomputes the entries of the affected HowTo groupings and livestream sessions; detached ones are removed. */
function updateGroupingMaps(
  howToGroupingMap: ReadWriteMap<HowToGroupingId, HowToGroupingMapEntry>,
  livestreamSessionMap: ReadWriteMap<LivestreamSessionId, LivestreamSessionMapEntry>,
  affectedParentIds: ReadonlySet<GraphIdentifier>,
  getNode: GetNode,
  getParts: GetParts
): void {
  affectedParentIds.forEach(parentId => {
    const parent = getNode(parentId);
    const isAttached = !!getParentId(parent);

    if (parent && hasType(parent, LIVESTREAM_SESSION_TYPE)) {
      isAttached
        ? livestreamSessionMap.set(
            getLivestreamSessionId(parent),
            toLivestreamSessionMapEntry(parent, getNode, getParts)
          )
        : livestreamSessionMap.delete(getLivestreamSessionId(parent));
    } else if (parent && hasType(parent, HOW_TO_TYPE)) {
      isAttached
        ? howToGroupingMap.set(getHowToGroupingId(parent), toHowToGroupingMapEntry(parent, getNode, getParts))
        : howToGroupingMap.delete(getHowToGroupingId(parent));
    }
  });
}

/**
 * A writable overlay of the store's persistent map: O(1), and O(changes) to commit. A plain `Map` (e.g. of
 * `INITIAL_STATE`) is converted once, O(n).
 */
function mutateMap<K, V>(map: ReadonlyMap<K, V>): ReadWriteMap<K, V> {
  const versioned: VersionedReadonlyMap<K, V> =
    typeof (map as Partial<VersionedReadonlyMap<K, V>>).mutate === 'function'
      ? (map as VersionedReadonlyMap<K, V>)
      : createReadonlyMap(map);

  return versioned.mutate();
}

/**
 * When the conversation is flat now and was flat before (the displayed list is its parts array, see
 * `stampFlatActivityPositions()`), patches the previous lists instead of rebuilding them: the parts before the first
 * changed one are the same, and unchanged parts keep their order and their entries.
 *
 * @returns `undefined` if the fast path does not apply.
 */
function patchFlatLists(
  previousState: State,
  partIndex: FlushResult['partIndex'],
  sortedMessageIds: FlushResult['sortedMessageIds'],
  changedNodeIds: FlushResult['changedNodeIds'],
  getNode: GetNode
):
  | {
      readonly sortedActivities: readonly Activity[];
      readonly sortedChatHistoryList: readonly SortedChatHistoryEntry[];
    }
  | undefined {
  const partIds = partIndex.get(CONVERSATION_ID) ?? [];
  const prevPartIds = previousState.graphPartIndex.get(CONVERSATION_ID) ?? [];
  const { sortedActivities: prevActivities, sortedChatHistoryList: prevList } = previousState;

  if (
    sortedMessageIds !== partIds ||
    getKnownFlat(prevPartIds) !== true ||
    prevActivities.length !== prevPartIds.length ||
    prevList.length !== prevPartIds.length
  ) {
    return undefined;
  }

  const changed = new Set(changedNodeIds);
  let prefixLength = Math.min(partIds.length, prevPartIds.length);

  changedNodeIds.forEach(id => {
    // IDs are unique: `lastIndexOf()` is the same index, found fast for appends (the common case).
    const index = partIds.lastIndexOf(id);
    const prevIndex = prevPartIds.lastIndexOf(id);

    ~index && (prefixLength = Math.min(prefixLength, index));
    ~prevIndex && (prefixLength = Math.min(prefixLength, prevIndex));
  });

  const sortedActivities = prevActivities.slice(0, prefixLength);
  const sortedChatHistoryList = prevList.slice(0, prefixLength);

  for (let index = prefixLength, prevIndex = prefixLength; index < partIds.length; index++) {
    // eslint-disable-next-line security/detect-object-injection
    const id = partIds[index]!;

    if (changed.has(id)) {
      const node = getNode(id);
      const entry = node && getActivityMapEntry(node);

      if (!node || !entry) {
        return undefined;
      }

      sortedActivities.push(entry.activity);
      sortedChatHistoryList.push(getSortedChatHistoryEntry(node));
    } else {
      // eslint-disable-next-line security/detect-object-injection
      while (prevIndex < prevPartIds.length && changed.has(prevPartIds[prevIndex]!)) {
        prevIndex++;
      }

      // eslint-disable-next-line security/detect-object-injection
      sortedActivities.push(prevActivities[prevIndex]!);
      // eslint-disable-next-line security/detect-object-injection
      sortedChatHistoryList.push(prevList[prevIndex]!);
      prevIndex++;
    }
  }

  return { sortedActivities, sortedChatHistoryList };
}

/**
 * Derives core's `State` from the graph after a transaction: the graph is the source of truth, `State` is a read model
 * kept for the reducer, its selectors and `state.activities`.
 *
 * Incremental: maps are the store's persistent maps, edited in O(changes); only the changed nodes, and the groupings
 * and sessions they are (or were) part of, are recomputed. For a flat conversation the two lists
 * (`sortedChatHistoryList`, `sortedActivities`) are patched from the previous ones (`patchFlatLists()`), otherwise
 * rebuilt from the part index with cached entries. Reads do not validate (the store did).
 */
export default function deriveState(
  graph: ActivitiesGraph,
  previousState: State,
  { changedNodeIds, changedParentIds, partIndex, previousNodes, sortedMessageIds }: FlushResult
): State {
  // The store's immutable snapshot of the commit that just happened: this state's graph.
  const snapshot = graph.store.getSnapshot();
  const getNode: GetNode = id => snapshot.get(id);
  const getParts: GetParts = parentId => partIndex.get(parentId) ?? [];

  const activityMaps: ActivityMaps = {
    activityIdToLocalIdMap: mutateMap(previousState.activityIdToLocalIdMap),
    activityMap: mutateMap(previousState.activityMap),
    clientActivityIdToLocalIdMap: mutateMap(previousState.clientActivityIdToLocalIdMap)
  };

  // Groupings and sessions to recompute: changed ones, the ones whose parts changed, the (former) parents of changed
  // nodes, and the HowTo of an affected session (its entry is part of the HowTo's entry).
  const affectedParentIds = new Set<GraphIdentifier>(changedParentIds);

  changedNodeIds.forEach(nodeId => {
    // Core never deletes a node (it detaches it), so every upserted node is in the snapshot.
    const node = getNode(nodeId);

    if (!node) {
      return;
    }

    [getParentId(node), getParentId(previousNodes.get(nodeId))].forEach(id => id && affectedParentIds.add(id));
    (hasType(node, HOW_TO_TYPE) || hasType(node, LIVESTREAM_SESSION_TYPE)) && affectedParentIds.add(nodeId);
    hasType(node, DIRECT_LINE_ACTIVITY_TYPE) &&
      updateActivityMaps(activityMaps, previousState.activityMap.get(nodeId satisfies string as LocalId), node);
  });

  Array.from(affectedParentIds).forEach(parentId => {
    const sessionParentId = hasType(getNode(parentId), LIVESTREAM_SESSION_TYPE) && getParentId(getNode(parentId));

    sessionParentId && affectedParentIds.add(sessionParentId);
  });

  const howToGroupingMap = mutateMap(previousState.howToGroupingMap);
  const livestreamSessionMap = mutateMap(previousState.livestreamSessionMap);

  updateGroupingMaps(howToGroupingMap, livestreamSessionMap, affectedParentIds, getNode, getParts);

  const patchedLists = patchFlatLists(previousState, partIndex, sortedMessageIds, changedNodeIds, getNode);

  const sortedChatHistoryList =
    patchedLists?.sortedChatHistoryList ??
    getParts(CONVERSATION_ID).flatMap(partId => {
      const part = getNode(partId);

      return part ? [getSortedChatHistoryEntry(part)] : [];
    });

  const sortedActivities =
    patchedLists?.sortedActivities ??
    (sortedMessageIds ?? getSortedMessages(getNode, getParts, CONVERSATION_ID).map(node => node['@id'])).flatMap(id => {
      const node = getNode(id);
      const entry = node && getActivityMapEntry(node);

      return entry ? [entry.activity] : [];
    });

  return Object.freeze({
    activityIdToLocalIdMap: activityMaps.activityIdToLocalIdMap.commit(),
    activityMap: activityMaps.activityMap.commit(),
    clientActivityIdToLocalIdMap: activityMaps.clientActivityIdToLocalIdMap.commit(),
    graph,
    graphPartIndex: partIndex,
    graphSnapshot: snapshot,
    howToGroupingMap: howToGroupingMap.commit(),
    livestreamSessionMap: livestreamSessionMap.commit(),
    sortedActivities: Object.freeze(sortedActivities),
    sortedChatHistoryList: Object.freeze(sortedChatHistoryList)
  } satisfies State);
}
