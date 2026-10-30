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
import { getBoxedActivity, getString, withProperties } from './private/nodeProperties';
import type WorkingGraph from './private/WorkingGraph';
import type { SortFacts } from './SortFacts';
import type { GraphIdentifier, GraphNode } from './types';
import { DIRECT_LINE_ACTIVITY, DIRECT_LINE_ACTIVITY_TYPE, MESSAGE_TYPE, SEND_STATUS } from './vocabulary';

const POSITION_INCREMENT = 1_000;

const SEND_STATUSES: ReadonlySet<string> = new Set<SendStatus>(['send failed', 'sending', 'sent']);

/** Output activity of each node, so an unchanged node keeps the same activity object (and React does not re-render). */
const outputActivityCache = new WeakMap<GraphNode, Activity>();

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

/**
 * Splits an activity into the node properties: the send status goes to `urn:microsoft:webchat:send-status`, the rest is
 * boxed as a JSON literal.
 */
function toActivityProperties(activity: Activity): Readonly<Record<string, unknown>> {
  const sendStatus = querySendStatusFromOutgoingActivity(activity);

  return Object.freeze({
    [DIRECT_LINE_ACTIVITY]: [
      Object.freeze({ '@type': '@json', '@value': setSendStatusInOutgoingActivity(activity, undefined) })
    ],
    [SEND_STATUS]: sendStatus ? [sendStatus] : undefined
  });
}

/** The node of an activity: its local ID, the activity boxed as a JSON literal, and its send status. */
function toActivityNode(activity: Activity): GraphNode {
  return withProperties(
    { '@id': getLocalIdFromActivity(activity), '@type': new Set([MESSAGE_TYPE, DIRECT_LINE_ACTIVITY_TYPE]) },
    toActivityProperties(activity)
  );
}

/**
 * The activity of a node, as core outputs it: the boxed activity with the send status read from the node
 * (`urn:microsoft:webchat:send-status`) into `channelData['webchat:send-status']`.
 */
function getActivity(node: GraphNode | undefined): Activity | undefined {
  if (!node) {
    return undefined;
  }

  const cachedActivity = outputActivityCache.get(node);

  if (cachedActivity) {
    return cachedActivity;
  }

  const boxedActivity = getBoxedActivity(node);
  const sendStatus = getString(node, SEND_STATUS);

  const activity =
    boxedActivity && sendStatus && SEND_STATUSES.has(sendStatus)
      ? setSendStatusInOutgoingActivity(boxedActivity, sendStatus satisfies string as SendStatus)
      : boxedActivity;

  activity && outputActivityCache.set(node, activity);

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

/** Replaces the activity of a node (boxed activity and send status), keeping its place. */
function replaceActivity(working: WorkingGraph, node: GraphNode, activity: Activity): void {
  working.setNode(withProperties(node, toActivityProperties(activity)));
}

/** Sets the send status of a node, keeping the boxed activity as-is. */
function setSendStatus(working: WorkingGraph, node: GraphNode, sendStatus: SendStatus): void {
  working.setNode(withProperties(node, { [SEND_STATUS]: [sendStatus] }));
}

/**
 * Stamps `channelData['webchat:internal:position']` over the flattened, displayed list, with the rule of `upsert.ts`:
 * keep a position if still increasing, else `last + 1` if it fits before the next one, else `last + 1000`.
 *
 * The graph keeps its own per-parent `position`; this one is the public output core had before.
 */
function stampActivityPositions(working: WorkingGraph, conversationId: GraphIdentifier): void {
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

    const boxedActivity = nextPosition !== position && getBoxedActivity(node);

    boxedActivity &&
      working.setNode(
        withProperties(node, {
          [DIRECT_LINE_ACTIVITY]: [
            Object.freeze({ '@type': '@json', '@value': setPositionInActivity(boxedActivity, nextPosition) })
          ]
        })
      );

    lastPosition = nextPosition;
  }

  // The displayed list does not change after stamping (positions only); `deriveState()` reuses it.
  working.setSortedMessageIds(nodes.map(node => node['@id']));
}

export { getActivity, replaceActivity, setSendStatus, stampActivityPositions, toActivityNode, toSortFacts };
