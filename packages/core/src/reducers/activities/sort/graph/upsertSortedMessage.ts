import { parse } from 'valibot';
import { getBoolean, getNumber, getParentId, toNumberValues, withProperties } from './private/nodeProperties';
import {
  afterPartLeft,
  detachPart,
  ensureNode,
  isGreaterInLivestreamSession,
  placeInConversation,
  placePart,
  type HowToPlacement
} from './private/treeOperations';
import type WorkingGraph from './private/WorkingGraph';
import { sortFactsSchema, type SortFacts } from './SortFacts';
import type { GraphIdentifier, GraphNode } from './types';
import {
  CONVERSATION_TYPE,
  FINALIZED,
  getHowToNodeId,
  getLivestreamSessionNodeId,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from './vocabulary';

// Moved from `upsert.ts`: the same rules, with the state in the graph instead of `State` maps.

function toHowToPlacement(howTo: SortFacts['howTo']): HowToPlacement | undefined {
  return (
    howTo && {
      groupingId: howTo.groupingId,
      howToId: getHowToNodeId(howTo.groupingId),
      position: howTo.position
    }
  );
}

/**
 * Places a livestream revision in its session, then the session in the conversation (directly or through its HowTo).
 */
function placeLivestreamRevision(
  working: WorkingGraph,
  conversationId: GraphIdentifier,
  {
    existingSession,
    howTo,
    isNewRevision,
    livestream,
    logicalTimestamp,
    messageId
  }: {
    readonly existingSession: GraphNode | undefined;
    readonly howTo: SortFacts['howTo'];
    readonly isNewRevision: boolean;
    readonly livestream: NonNullable<SortFacts['livestream']>;
    readonly logicalTimestamp: number | undefined;
    readonly messageId: GraphIdentifier;
  }
): void {
  const sessionId = getLivestreamSessionNodeId(livestream.sessionId);
  const session = ensureNode(working, sessionId, LIVESTREAM_SESSION_TYPE, livestream.sessionId);

  // Same as the fast path in `upsert.ts`: a new interim revision of an existing session outside of a HowTo does not
  // move the session.
  const keepSessionPlace = !!existingSession && isNewRevision && !livestream.final && !howTo;

  working.setNode(
    withProperties(session, {
      [FINALIZED]: livestream.final ? Object.freeze([true]) : undefined,
      // The session sorts by its first revision, then by its final revision.
      // Revisions 2...N-1 do not move it, otherwise it would "flash" to the bottom.
      [LOGICAL_TIMESTAMP]:
        livestream.final || !existingSession
          ? toNumberValues(logicalTimestamp)
          : toNumberValues(getNumber(existingSession, LOGICAL_TIMESTAMP)),
      [PART_POSITION]: keepSessionPlace
        ? toNumberValues(getNumber(existingSession, PART_POSITION))
        : toNumberValues(howTo?.position)
    })
  );

  // A re-sent revision (same ID) replaces its previous place.
  placePart(working, sessionId, messageId, isGreaterInLivestreamSession, { keepPlace: false });

  if (keepSessionPlace) {
    return;
  }

  const sessionParentId = howTo ? getHowToNodeId(howTo.groupingId) : conversationId;

  getParentId(working.getNode(sessionId)) !== sessionParentId && afterPartLeft(working, detachPart(working, sessionId));

  placeInConversation(working, conversationId, sessionId, toHowToPlacement(howTo));
}

/**
 * Upserts a message node into the transcript of a conversation and re-sorts the affected parts.
 *
 * The conversation node is created if missing.
 *
 * @returns `false` if the message was dropped because its livestream session is concluded, otherwise `true`.
 */
export default function upsertSortedMessage(
  working: WorkingGraph,
  conversationId: GraphIdentifier,
  node: GraphNode,
  sortFacts: SortFacts
): boolean {
  const { howTo, livestream, localTimestamp, logicalTimestamp } = parse(sortFactsSchema, sortFacts);
  const messageId = node['@id'];
  const existingMessage = working.getNode(messageId);

  const sessionId = livestream && getLivestreamSessionNodeId(livestream.sessionId);
  const existingSession = sessionId && working.getNode(sessionId);

  if (existingSession && getBoolean(existingSession, FINALIZED)) {
    console.warn(
      `botframework-webchat: Cannot update livestreaming session ${livestream?.sessionId} because it has been concluded`
    );

    return false;
  }

  ensureNode(working, conversationId, CONVERSATION_TYPE);

  const parentId = sessionId || (howTo ? getHowToNodeId(howTo.groupingId) : conversationId);

  // An update can leave, join, or move between HowTo groupings: leave the former parent first.
  // Livestream revisions always stay in their session.
  getParentId(existingMessage) !== parentId && afterPartLeft(working, detachPart(working, messageId));

  const currentMessage = working.getNode(messageId);

  working.setNode(
    withProperties(node, {
      hasPart: undefined,
      // Keep membership and position as a hint, `writeParts()` keeps the position if it is still in order.
      isPartOf: currentMessage?.isPartOf,
      position: currentMessage?.position,
      [LOCAL_TIMESTAMP]: toNumberValues(localTimestamp),
      [LOGICAL_TIMESTAMP]: toNumberValues(logicalTimestamp),
      [PART_POSITION]: sessionId ? undefined : toNumberValues(howTo?.position),
      [STREAM_SEQUENCE]:
        livestream && 'sequenceNumber' in livestream ? toNumberValues(livestream.sequenceNumber) : undefined
    })
  );

  livestream
    ? placeLivestreamRevision(working, conversationId, {
        existingSession,
        howTo,
        isNewRevision: !existingMessage,
        livestream,
        logicalTimestamp,
        messageId
      })
    : placeInConversation(working, conversationId, messageId, toHowToPlacement(howTo));

  return true;
}
