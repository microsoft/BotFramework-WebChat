import { parse } from 'valibot';
import { getBoolean, getNumber, getParentId, toNumberValues, withProperties } from './private/nodeProperties';
import {
  afterPartLeft,
  compareInLivestreamSession,
  detachPart,
  ensureNode,
  placeInConversation,
  placePart
} from './private/treeOperations';
import { sortFactsSchema, type SortFacts } from './SortFacts';
import type { GraphIdentifier, GraphNode, GraphTransaction } from './types';
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

function toHowToPlacement(howTo: SortFacts['howTo']) {
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
  transaction: GraphTransaction,
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
  const session = ensureNode(transaction, sessionId, LIVESTREAM_SESSION_TYPE, livestream.sessionId);

  // Same as the fast path in `upsert.ts`: a new interim revision of an existing session outside of a HowTo does not
  // move the session.
  const keepSessionPlace = !!existingSession && isNewRevision && !livestream.final && !howTo;

  transaction.upsertNode(
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
  placePart(transaction, sessionId, messageId, compareInLivestreamSession, { keepPlace: false });

  if (keepSessionPlace) {
    return;
  }

  const sessionParentId = howTo ? getHowToNodeId(howTo.groupingId) : conversationId;

  getParentId(transaction.getNode(sessionId)) !== sessionParentId &&
    afterPartLeft(transaction, detachPart(transaction, sessionId));

  placeInConversation(transaction, conversationId, sessionId, toHowToPlacement(howTo));
}

/**
 * Upserts a message node into the transcript of a conversation and re-sorts the affected parts, in the transaction.
 *
 * The conversation node is created if missing.
 *
 * @returns `false` if the message was dropped because its livestream session is concluded, otherwise `true`.
 */
export default function upsertSortedMessage(
  transaction: GraphTransaction,
  conversationId: GraphIdentifier,
  node: GraphNode,
  sortFacts: SortFacts
): boolean {
  const { howTo, livestream, localTimestamp, logicalTimestamp } = parse(sortFactsSchema, sortFacts);
  const messageId = node['@id'];
  const existingMessage = transaction.getNode(messageId);

  const sessionId = livestream && getLivestreamSessionNodeId(livestream.sessionId);
  const existingSession = sessionId && transaction.getNode(sessionId);

  if (existingSession && getBoolean(existingSession, FINALIZED)) {
    console.warn(
      `botframework-webchat: Cannot update livestreaming session ${livestream?.sessionId} because it has been concluded`
    );

    return false;
  }

  ensureNode(transaction, conversationId, CONVERSATION_TYPE);

  const parentId = sessionId || (howTo ? getHowToNodeId(howTo.groupingId) : conversationId);

  // An update can leave, join, or move between HowTo groupings: leave the former parent first.
  // Livestream revisions always stay in their session.
  getParentId(existingMessage) !== parentId && afterPartLeft(transaction, detachPart(transaction, messageId));

  const currentMessage = transaction.getNode(messageId);

  transaction.upsertNode(
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
    ? placeLivestreamRevision(transaction, conversationId, {
        existingSession,
        howTo,
        isNewRevision: !existingMessage,
        livestream,
        logicalTimestamp,
        messageId
      })
    : placeInConversation(transaction, conversationId, messageId, toHowToPlacement(howTo));

  return true;
}
