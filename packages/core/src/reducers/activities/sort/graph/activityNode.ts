import type { GlobalScopePonyfill } from '../../../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../../../utils/getActivityLivestreamingMetadata';
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
import getSortedMessages from './getSortedMessages';
import { isFlat } from './private/flatParts';
import { getBoxedActivity, getString, withProperties } from './private/nodeProperties';
import type WorkingGraph from './private/WorkingGraph';
import type { SortFacts } from './SortFacts';
import type { GraphIdentifier, GraphNode } from './types';
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

/** Boxes the activity kept by core as the JSON literal the node holds. */
function toJSONLiteral(keptActivity: Activity): Readonly<{ '@type': '@json'; '@value': unknown }> {
  return Object.freeze({ '@type': '@json', '@value': keptActivity });
}

/**
 * Splits an activity: the send status goes to the node (`urn:microsoft:webchat:send-status`), the rest is kept by core
 * as the host sent it (`State.graphActivities`) and boxed in the node as a JSON literal.
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
      [DIRECT_LINE_ACTIVITY]: [toJSONLiteral(keptActivity)],
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
function toSortFacts(activity: Activity, ponyfill: Pick<GlobalScopePonyfill, 'Date'>): SortFacts {
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

  if (keptActivity) {
    const nextActivity = setPositionInActivity(keptActivity, position);

    working.setActivity(node['@id'], nextActivity);
    working.setNode(withProperties(node, { [DIRECT_LINE_ACTIVITY]: [toJSONLiteral(nextActivity)] }));
  }
}

/**
 * `stampActivityPositions()` for a flat conversation (messages only), where the displayed list is the conversation's
 * parts array. Same rule and result as the full pass: the messages before the first changed one keep their positions
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
 * Stamps `channelData['webchat:internal:position']` over the flattened, displayed list, with the rule of `upsert.ts`:
 * keep a position if still increasing, else `last + 1` if it fits before the next one, else `last + 1000`.
 *
 * The graph keeps its own per-parent `position`; this one is the public output core had before.
 *
 * A flat conversation (messages only, the common case) takes the fast path (`stampFlatActivityPositions()`); a
 * conversation with a HowTo or a livestream session walks the whole tree.
 */
function stampActivityPositions(working: WorkingGraph, conversationId: GraphIdentifier): void {
  if (stampFlatActivityPositions(working, conversationId)) {
    return;
  }

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
