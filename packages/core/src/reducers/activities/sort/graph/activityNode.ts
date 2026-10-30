import type { GlobalScopePonyfill } from '../../../../types/GlobalScopePonyfill';
import getActivityLivestreamingMetadata from '../../../../utils/getActivityLivestreamingMetadata';
import getLogicalTimestamp from '../private/getLogicalTimestamp';
import getPartGroupingMetadataMap from '../private/getPartGroupingMetadataMap';
import { getLocalIdFromActivity } from '../property/LocalId';
import { queryPositionFromActivity, setPositionInActivity } from '../property/Position';
import { querySendStatusFromOutgoingActivity } from '../property/SendStatus';
import type { Activity } from '../types';
import getSortedMessages from './getSortedMessages';
import { getActivity, withProperties } from './private/nodeProperties';
import type { SortFacts } from './SortFacts';
import type { GraphIdentifier, GraphNode, GraphTransaction } from './types';
import { DIRECT_LINE_ACTIVITY, DIRECT_LINE_ACTIVITY_TYPE, MESSAGE_TYPE, SEND_STATUS } from './vocabulary';

const POSITION_INCREMENT = 1_000;

function toFiniteNumber(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** The node of an activity: its local ID, the activity boxed as a JSON literal, and its send status. */
function toActivityNode(activity: Activity): GraphNode {
  const sendStatus = querySendStatusFromOutgoingActivity(activity);

  return {
    '@id': getLocalIdFromActivity(activity),
    '@type': new Set([MESSAGE_TYPE, DIRECT_LINE_ACTIVITY_TYPE]),
    [DIRECT_LINE_ACTIVITY]: [Object.freeze({ '@type': '@json', '@value': activity })],
    ...(sendStatus ? { [SEND_STATUS]: [sendStatus] } : {})
  };
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

/** Replaces the activity boxed in a node, keeping its place. */
function replaceActivity(transaction: GraphTransaction, node: GraphNode, activity: Activity): void {
  const sendStatus = querySendStatusFromOutgoingActivity(activity);

  transaction.upsertNode(
    withProperties(node, {
      [DIRECT_LINE_ACTIVITY]: [Object.freeze({ '@type': '@json', '@value': activity })],
      [SEND_STATUS]: sendStatus ? [sendStatus] : undefined
    })
  );
}

/**
 * Stamps `channelData['webchat:internal:position']` over the flattened, displayed list, with the rule of `upsert.ts`:
 * keep a position if still increasing, else `last + 1` if it fits before the next one, else `last + 1000`.
 *
 * The graph keeps its own per-parent `position`; this one is the public output core had before.
 */
function stampActivityPositions(transaction: GraphTransaction, conversationId: GraphIdentifier): void {
  const nodes = getSortedMessages(id => transaction.getNode(id), conversationId);
  const positions = nodes.map(node => {
    const activity = getActivity(node);

    return activity && queryPositionFromActivity(activity);
  });

  let lastPosition = 0;

  for (const [index, node] of nodes.entries()) {
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

    const activity = getActivity(node);

    nextPosition !== position &&
      activity &&
      replaceActivity(transaction, node, setPositionInActivity(activity, nextPosition));

    lastPosition = nextPosition;
  }
}

export { replaceActivity, stampActivityPositions, toActivityNode, toSortFacts };
