import type { ActivitiesCoreEnv } from '../ActivitiesCoreEnv';
import getLogicalTimestamp from '../private/getLogicalTimestamp';
import getPartGroupingMetadataMap from '../private/getPartGroupingMetadataMap';
import { getLocalIdFromActivity } from '../property/LocalId';
import { setPositionInActivity } from '../property/Position';
import {
  querySendStatusFromOutgoingActivity,
  setSendStatusInOutgoingActivity,
  type SendStatus
} from '../property/SendStatus';
import type { Activity } from '../types';
import getActivityLivestreamingMetadata from '../utils/getActivityLivestreamingMetadata';
import getSortedMessages from './getSortedMessages';
import {
  getChangedConversationParts,
  getChangedRange,
  pushDisplayedMessages,
  type GetParts
} from './private/displayedMessages';
import { isFlat } from './private/flatParts';
import { getBoxedActivity, getString, withProperties } from './private/nodeProperties';
import toJSONValue from './private/toJSONValue';
import type WorkingGraph from './private/WorkingGraph';
import type { SortFacts } from './SortFacts';
import type { GetNode, GraphIdentifier, GraphNode } from './types';
import { DIRECT_LINE_ACTIVITY, DIRECT_LINE_ACTIVITY_TYPE, MESSAGE_TYPE, SEND_STATUS } from './vocabulary';

const POSITION_INCREMENT = 1_000;

const SEND_STATUSES: ReadonlySet<string> = new Set<SendStatus>(['send failed', 'sending', 'sent']);

/**
 * Output activity of each kept activity (`State.graphActivities`) with its send status, so an unchanged activity keeps
 * the same object (and React does not re-render).
 */
const outputActivityCache = new WeakMap<Activity, { readonly activity: Activity; readonly sendStatus: SendStatus }>();

/** `webchat:internal:position` of each node (the node objects are immutable). */
const activityPositionCache = new WeakMap<GraphNode, number | undefined>();

function toFiniteNumber(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Plain read: runs for every displayed activity of every action, so no valibot here. */
function getActivityPosition(activity: Activity | undefined): number | undefined {
  const position = activity?.channelData?.['webchat:internal:position'];

  return typeof position === 'number' ? position : undefined;
}

function getCachedActivityPosition(node: GraphNode): number | undefined {
  if (activityPositionCache.has(node)) {
    return activityPositionCache.get(node);
  }

  const position = getActivityPosition(getBoxedActivity(node));

  activityPositionCache.set(node, position);

  return position;
}

/** Boxes a JSON value (see `toJSONValue()`) as the JSON literal the node holds. */
function toJSONLiteral(jsonValue: unknown): Readonly<{ '@type': '@json'; '@value': unknown }> {
  return Object.freeze({ '@type': '@json', '@value': jsonValue });
}

/**
 * Splits an activity: the send status goes to the node (`urn:microsoft:webchat:send-status`), the rest is kept by core
 * as the host sent it (`State.graphActivities`) and boxed in the node as a JSON literal of its JSON projection.
 */
function splitActivity(activity: Activity): {
  readonly keptActivity: Activity;
  readonly properties: Readonly<Record<string, unknown>>;
} {
  const sendStatus = querySendStatusFromOutgoingActivity(activity);
  const keptActivity = setSendStatusInOutgoingActivity(activity, undefined);

  return {
    keptActivity,
    properties: Object.freeze({
      [DIRECT_LINE_ACTIVITY]: [toJSONLiteral(toJSONValue(keptActivity))],
      [SEND_STATUS]: sendStatus ? [sendStatus] : undefined
    })
  };
}

/**
 * The node of an activity (its local ID, the activity boxed as a JSON literal, and its send status), and the activity
 * core keeps for it (`WorkingGraph.setActivity()`).
 */
function toActivityNode(activity: Activity): { readonly activity: Activity; readonly node: GraphNode } {
  const { keptActivity, properties } = splitActivity(activity);

  return {
    activity: keptActivity,
    node: withProperties(
      { '@id': getLocalIdFromActivity(activity), '@type': new Set([MESSAGE_TYPE, DIRECT_LINE_ACTIVITY_TYPE]) },
      properties
    )
  };
}

/**
 * The activity of a node, as core outputs it: the activity kept by core (the host's object, not the store's JSON copy)
 * with the send status read from the node (`urn:microsoft:webchat:send-status`) into `channelData['webchat:send-status']`.
 */
function getActivity(node: GraphNode | undefined, keptActivity: Activity | undefined): Activity | undefined {
  const sendStatus = getString(node, SEND_STATUS);

  if (!node || !keptActivity || !sendStatus || !SEND_STATUSES.has(sendStatus)) {
    return node && keptActivity;
  }

  const cached = outputActivityCache.get(keptActivity);

  if (cached?.sendStatus === sendStatus) {
    return cached.activity;
  }

  const activity = setSendStatusInOutgoingActivity(keptActivity, sendStatus satisfies string as SendStatus);

  outputActivityCache.set(keptActivity, Object.freeze({ activity, sendStatus: sendStatus as SendStatus }));

  return activity;
}

/** Extracts the sort facts of an activity, with the same helpers `upsert.ts` used. */
function toSortFacts(activity: Activity, ponyfill: ActivitiesCoreEnv): SortFacts {
  const howTo = getPartGroupingMetadataMap(activity).get('HowTo');
  const livestreamingMetadata = getActivityLivestreamingMetadata(activity);
  const { localTimestamp } = activity;

  return Object.freeze({
    howTo: howTo && Object.freeze({ groupingId: howTo.groupingId, position: toFiniteNumber(howTo.position) }),
    livestream:
      livestreamingMetadata &&
      (livestreamingMetadata.type === 'final activity'
        ? Object.freeze({ final: true as const, sessionId: livestreamingMetadata.sessionId })
        : Object.freeze({
            final: false as const,
            sequenceNumber: livestreamingMetadata.sequenceNumber,
            sessionId: livestreamingMetadata.sessionId
          })),
    // Same as `upsert.ts`: `localTimestamp` is parsed as a date.
    localTimestamp: toFiniteNumber(typeof localTimestamp === 'string' ? +new ponyfill.Date(localTimestamp) : undefined),
    logicalTimestamp: toFiniteNumber(getLogicalTimestamp(activity, ponyfill))
  });
}

/** Replaces the activity of a node (kept activity, JSON literal and send status), keeping its place. */
function replaceActivity(working: WorkingGraph, node: GraphNode, activity: Activity): void {
  const { keptActivity, properties } = splitActivity(activity);

  working.setActivity(node['@id'], keptActivity);
  working.setNode(withProperties(node, properties));
}

/** Sets the send status of a node, keeping the boxed activity as-is. */
function setSendStatus(working: WorkingGraph, node: GraphNode, sendStatus: SendStatus): void {
  working.setNode(withProperties(node, { [SEND_STATUS]: [sendStatus] }));
}

/** Sets the public position (`channelData['webchat:internal:position']`) of a message node and its kept activity. */
function setActivityPosition(working: WorkingGraph, node: GraphNode, position: number): void {
  const keptActivity = working.getActivity(node['@id']);
  const boxedActivity = getBoxedActivity(node);

  if (keptActivity) {
    const nextActivity = setPositionInActivity(keptActivity, position);

    working.setActivity(node['@id'], nextActivity);
    working.setNode(
      withProperties(node, {
        // The JSON projection of `nextActivity`: the node's projection with the same (JSON) change.
        [DIRECT_LINE_ACTIVITY]: [
          toJSONLiteral(boxedActivity ? setPositionInActivity(boxedActivity, position) : toJSONValue(nextActivity))
        ]
      })
    );
  }
}

/**
 * `stampActivityPositions()` for a flat conversation (messages only), where the displayed list is the conversation's
 * parts array. Same rule and result as the full pass, if the previous positions were increasing (see
 * `stampActivityPositions()`): the messages before the first changed one keep their positions
 * (they were stamped by an earlier pass and are unchanged), and after the last changed one the first kept position
 * ends the pass (the rest was increasing before and is unchanged).
 *
 * @returns `false` if the conversation is not flat (the caller does the full pass).
 */
function stampFlatActivityPositions(working: WorkingGraph, conversationId: GraphIdentifier): boolean {
  const partIds = working.getParts(conversationId);
  const getNode = (id: GraphIdentifier) => working.getNode(id);

  if (!isFlat(partIds, getNode)) {
    return false;
  }

  let firstIndex = partIds.length;
  let lastIndex = -1;

  for (const id of working.getPendingNodeIds()) {
    // IDs are unique: `lastIndexOf()` is the same index, found fast for appends (the common case).
    const index = partIds.lastIndexOf(id);

    if (~index) {
      firstIndex = Math.min(firstIndex, index);
      lastIndex = Math.max(lastIndex, index);
    }
  }

  const getPosition = (index: number): number | undefined => {
    // eslint-disable-next-line security/detect-object-injection
    const node = index < partIds.length ? working.getNode(partIds[index]!) : undefined;

    return node && getCachedActivityPosition(node);
  };

  let lastPosition = firstIndex ? getPosition(firstIndex - 1) : 0;

  if (typeof lastPosition === 'undefined') {
    return false;
  }

  let nextSiblingPosition = getPosition(firstIndex);

  for (let index = firstIndex; index < partIds.length; index++) {
    // eslint-disable-next-line security/detect-object-injection
    const node = working.getNode(partIds[index]!)!;
    const position = nextSiblingPosition;
    const hasNextSibling = index + 1 < partIds.length;

    nextSiblingPosition = getPosition(index + 1);

    if (index > lastIndex && typeof position !== 'undefined' && position > lastPosition) {
      break;
    }

    const nextPosition =
      typeof position !== 'undefined' && position > lastPosition
        ? position
        : hasNextSibling && typeof nextSiblingPosition !== 'undefined' && lastPosition + 1 <= nextSiblingPosition
          ? lastPosition + 1
          : lastPosition + POSITION_INCREMENT;

    nextPosition !== position && setActivityPosition(working, node, nextPosition);

    lastPosition = nextPosition;
  }

  working.setSortedMessageIds(partIds);

  return true;
}

/**
 * `stampActivityPositions()` from the first changed part of the conversation on (`getChangedRange()`), for any
 * transcript (HowTo groupings, livestream sessions). Same rule and result as the full pass, if the previous positions
 * were increasing (see `stampActivityPositions()`):
 *
 * - the displayed messages of the parts before the first changed part are the same as before, and were stamped in
 *   increasing order by an earlier pass: the full pass keeps them;
 * - after the last changed part, the displayed messages are unchanged and in the same order as before (increasing):
 *   from the first one that keeps its position, the full pass keeps them all.
 *
 * @returns `false` if the message before the first changed part has no position (the caller does the full pass).
 */
function stampChangedActivityPositions(working: WorkingGraph, conversationId: GraphIdentifier): boolean {
  const getNode: GetNode = id => working.getNode(id);
  const getParts: GetParts = id => working.getParts(id);
  const partIds = working.getParts(conversationId);
  const { firstIndex, lastIndex } = getChangedRange(
    partIds,
    working.getPreviousParts(conversationId),
    getChangedConversationParts(
      conversationId,
      [...working.getPendingNodeIds(), ...working.getPendingParentIds()],
      getNode,
      id => working.getPreviousNode(id)
    )
  );

  let lastPosition: number | undefined = 0;

  if (firstIndex) {
    const previousMessages: GraphNode[] = [];

    pushDisplayedMessages(getNode, getParts, partIds[firstIndex - 1]!, previousMessages);

    // eslint-disable-next-line no-magic-numbers
    const previousMessage = previousMessages.at(-1);

    lastPosition = previousMessage && getCachedActivityPosition(previousMessage);
  }

  if (typeof lastPosition === 'undefined') {
    return false;
  }

  // The displayed messages from the first changed part on, expanded part by part as the pass reaches them.
  const messages: GraphNode[] = [];
  let nextPartIndex = firstIndex;
  // Index (in `messages`) of the last displayed message of the last changed part.
  let lastChangedMessageIndex = -1;

  const hasMessage = (index: number): boolean => {
    while (messages.length <= index && nextPartIndex < partIds.length) {
      // eslint-disable-next-line security/detect-object-injection
      pushDisplayedMessages(getNode, getParts, partIds[nextPartIndex]!, messages);
      nextPartIndex <= lastIndex && (lastChangedMessageIndex = messages.length - 1);
      nextPartIndex++;
    }

    return index < messages.length;
  };

  for (let index = 0; hasMessage(index); index++) {
    // eslint-disable-next-line security/detect-object-injection
    const node = messages[index]!;
    const position = getCachedActivityPosition(node);
    const hasNextSibling = hasMessage(index + 1);
    const nextSiblingPosition = hasNextSibling ? getCachedActivityPosition(messages[index + 1]!) : undefined;

    if (index > lastChangedMessageIndex && typeof position !== 'undefined' && position > lastPosition) {
      break;
    }

    const nextPosition =
      typeof position !== 'undefined' && position > lastPosition
        ? position
        : hasNextSibling && typeof nextSiblingPosition !== 'undefined' && lastPosition + 1 <= nextSiblingPosition
          ? lastPosition + 1
          : lastPosition + POSITION_INCREMENT;

    nextPosition !== position && setActivityPosition(working, node, nextPosition);

    lastPosition = nextPosition;
  }

  return true;
}

/**
 * Stamps `channelData['webchat:internal:position']` over the flattened, displayed list, with the rule of `upsert.ts`:
 * keep a position if still increasing, else `last + 1` if it fits before the next one, else `last + 1000`.
 *
 * The graph keeps its own per-parent `position`; this one is the public output core had before.
 *
 * A flat conversation (messages only, the common case) takes the fast path (`stampFlatActivityPositions()`); other
 * transcripts are stamped from their first changed part on (`stampChangedActivityPositions()`). The full pass over the
 * whole tree is the fallback. Both fast passes assume that the displayed messages had increasing positions before this
 * transaction: when they may not (`State.graphStalePositions`, after a delete), the full pass runs.
 */
function stampActivityPositions(working: WorkingGraph, conversationId: GraphIdentifier): void {
  if (
    !working.hasStalePositions() &&
    (stampFlatActivityPositions(working, conversationId) || stampChangedActivityPositions(working, conversationId))
  ) {
    return;
  }

  working.setStalePositions(false);

  const nodes = getSortedMessages(
    id => working.getNode(id),
    id => working.getParts(id),
    conversationId
  );

  const positions = nodes.map(getCachedActivityPosition);

  let lastPosition = 0;

  // Index loop: this runs over every displayed activity of every action.
  for (let index = 0; index < nodes.length; index++) {
    // eslint-disable-next-line security/detect-object-injection
    const node = nodes[index]!;
    // eslint-disable-next-line security/detect-object-injection
    const position = positions[index];
    const hasNextSibling = index + 1 < nodes.length;
    const nextSiblingPosition = positions[index + 1];

    const nextPosition =
      typeof position !== 'undefined' && position > lastPosition
        ? position
        : hasNextSibling && typeof nextSiblingPosition !== 'undefined' && lastPosition + 1 <= nextSiblingPosition
          ? lastPosition + 1
          : lastPosition + POSITION_INCREMENT;

    nextPosition !== position && setActivityPosition(working, node, nextPosition);

    lastPosition = nextPosition;
  }

  // The displayed list does not change after stamping (positions only); `deriveState()` reuses it.
  working.setSortedMessageIds(nodes.map(node => node['@id']));
}

export { getActivity, replaceActivity, setSendStatus, stampActivityPositions, toActivityNode, toSortFacts };
