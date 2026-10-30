import type { LocalId } from '../property/LocalId';
import type {
  ActivityMapEntry,
  HowToGroupingId,
  HowToGroupingMap,
  HowToGroupingMapEntry,
  HowToGroupingMapPartEntry,
  LivestreamSessionId,
  LivestreamSessionMap,
  LivestreamSessionMapEntry,
  LivestreamSessionMapEntryActivityEntry,
  SortedChatHistoryEntry,
  State
} from '../types';
import { getActivity } from './activityNode';
import { CONVERSATION_ID, type ActivitiesGraph } from './createActivitiesGraph';
import getSortedMessages, { type GetParts } from './getSortedMessages';
import type { GraphJournal } from './private/graphJournal';
import { getBoolean, getIdentifier, getNumber, getParentId, hasType } from './private/nodeProperties';
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
  readonly activityIdToLocalIdMap: Map<string, LocalId>;
  readonly activityMap: Map<LocalId, ActivityMapEntry>;
  readonly clientActivityIdToLocalIdMap: Map<string, LocalId>;
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
  howToGroupingMap: Map<HowToGroupingId, HowToGroupingMapEntry>,
  livestreamSessionMap: Map<LivestreamSessionId, LivestreamSessionMapEntry>,
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

type GraphChanges = FlushResult & {
  /** The journal including this transaction. */
  readonly graphJournal: GraphJournal;
};

/**
 * Derives core's `State` from the graph after a transaction: the graph is the source of truth, `State` is a read model
 * kept for the reducer, its selectors and `state.activities`.
 *
 * Incremental: maps start from the previous state and only the changed nodes, and the groupings and sessions they are
 * (or were) part of, are recomputed. The two lists (`sortedChatHistoryList`, `sortedActivities`) are rebuilt from the
 * part index with cached entries, as `upsert.ts` rebuilt `sortedActivities`. Reads do not validate (the store did).
 */
export default function deriveState(
  graph: ActivitiesGraph,
  previousState: State,
  { changedNodes, changedParentIds, graphJournal, partIndex, previousNodes, sortedMessageIds }: GraphChanges
): State {
  // The store's live map: right after the transaction, it is this state's graph.
  const snapshot = graph.store.getSnapshot();
  const getNode: GetNode = id => snapshot.get(id);
  const getParts: GetParts = parentId => partIndex.get(parentId) ?? [];

  const activityMaps: ActivityMaps = {
    activityIdToLocalIdMap: new Map(previousState.activityIdToLocalIdMap),
    activityMap: new Map(previousState.activityMap),
    clientActivityIdToLocalIdMap: new Map(previousState.clientActivityIdToLocalIdMap)
  };

  // Groupings and sessions to recompute: changed ones, the ones whose parts changed, the (former) parents of changed
  // nodes, and the HowTo of an affected session (its entry is part of the HowTo's entry).
  const affectedParentIds = new Set<GraphIdentifier>(changedParentIds);

  changedNodes.forEach(node => {
    const nodeId = node['@id'];

    [getParentId(node), getParentId(previousNodes.get(nodeId))].forEach(id => id && affectedParentIds.add(id));
    (hasType(node, HOW_TO_TYPE) || hasType(node, LIVESTREAM_SESSION_TYPE)) && affectedParentIds.add(nodeId);
    hasType(node, DIRECT_LINE_ACTIVITY_TYPE) &&
      updateActivityMaps(activityMaps, previousState.activityMap.get(nodeId satisfies string as LocalId), node);
  });

  Array.from(affectedParentIds).forEach(parentId => {
    const sessionParentId = hasType(getNode(parentId), LIVESTREAM_SESSION_TYPE) && getParentId(getNode(parentId));

    sessionParentId && affectedParentIds.add(sessionParentId);
  });

  const howToGroupingMap = new Map<HowToGroupingId, HowToGroupingMapEntry>(previousState.howToGroupingMap);
  const livestreamSessionMap = new Map<LivestreamSessionId, LivestreamSessionMapEntry>(
    previousState.livestreamSessionMap
  );

  updateGroupingMaps(howToGroupingMap, livestreamSessionMap, affectedParentIds, getNode, getParts);

  const sortedChatHistoryList: SortedChatHistoryEntry[] = [];

  getParts(CONVERSATION_ID).forEach(partId => {
    const part = getNode(partId);

    part && sortedChatHistoryList.push(getSortedChatHistoryEntry(part));
  });

  const sortedActivities = (
    sortedMessageIds ?? getSortedMessages(getNode, getParts, CONVERSATION_ID).map(node => node['@id'])
  ).flatMap(id => {
    const node = getNode(id);
    const entry = node && getActivityMapEntry(node);

    return entry ? [entry.activity] : [];
  });

  return Object.freeze({
    activityIdToLocalIdMap: Object.freeze(activityMaps.activityIdToLocalIdMap),
    activityMap: Object.freeze(activityMaps.activityMap) satisfies State['activityMap'],
    clientActivityIdToLocalIdMap: Object.freeze(activityMaps.clientActivityIdToLocalIdMap),
    graph,
    graphJournal,
    graphPartIndex: partIndex,
    graphVersion: graph.version,
    howToGroupingMap: Object.freeze(howToGroupingMap) satisfies HowToGroupingMap,
    livestreamSessionMap: Object.freeze(livestreamSessionMap) satisfies LivestreamSessionMap,
    sortedActivities: Object.freeze(sortedActivities),
    sortedChatHistoryList: Object.freeze(sortedChatHistoryList)
  } satisfies State);
}

export { type GraphChanges };
