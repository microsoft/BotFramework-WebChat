import { parse } from 'valibot';
import type { Node } from '../node/Node.ts';
import { identifierSchema, type Identifier } from '../node/NodeIdentifier.ts';
import type { StoreTransaction } from '../Store.ts';
import getOrderedParts from './private/getOrderedParts.ts';
import insertSorted from './insertSorted.ts';
import {
  getBoolean,
  getNumber,
  getParentId,
  hasType,
  toNumberValues,
  withProperties
} from './private/nodeProperties.ts';
import { sortableMessageSchema, type SafeSortableMessage, type SortableMessage } from './SortableMessage.ts';
import {
  CONVERSATION_TYPE,
  FINALIZED,
  getHowToNodeId,
  getLivestreamSessionNodeId,
  HOW_TO_TYPE,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from './vocabulary.ts';

// Ported from `packages/core/src/reducers/activities/sort/upsert.ts`.
//
// The transcript is a tree of `hasPart`/`isPartOf`: Conversation → (Message | livestream session | HowTo),
// HowTo → (Message | livestream session), livestream session → Message revisions.
// Every part has a `position` relative to its parent, strictly increasing in display order.
//
// Like core, every level is an insertion sort: arrival order decides ties and parts without sort keys.
// A stateless sort over the snapshot cannot reproduce this, so positions are written at upsert time.

const POSITION_INCREMENT = 1_000;

/** Compare result meaning "not greater": the new part goes after it, which keeps arrival order. */
const NOT_GREATER = -1;

type CompareFn = (x: Node, y: Node) => number;

function isMessage(node: Node): boolean {
  return !hasType(node, HOW_TO_TYPE) && !hasType(node, LIVESTREAM_SESSION_TYPE);
}

// Compare logical timestamps if both have them, otherwise local timestamps if both are messages and have them.
// Otherwise -1 ("not greater"), which keeps arrival order.
const compareInConversation: CompareFn = (x, y) => {
  const xLogicalTimestamp = getNumber(x, LOGICAL_TIMESTAMP);
  const yLogicalTimestamp = getNumber(y, LOGICAL_TIMESTAMP);

  if (typeof xLogicalTimestamp !== 'undefined' && typeof yLogicalTimestamp !== 'undefined') {
    return xLogicalTimestamp - yLogicalTimestamp;
  }

  if (isMessage(x) && isMessage(y)) {
    const xLocalTimestamp = getNumber(x, LOCAL_TIMESTAMP);
    const yLocalTimestamp = getNumber(y, LOCAL_TIMESTAMP);

    if (typeof xLocalTimestamp !== 'undefined' && typeof yLocalTimestamp !== 'undefined') {
      return xLocalTimestamp - yLocalTimestamp;
    }
  }

  return NOT_GREATER;
};

const compareInHowTo: CompareFn = (x, y) => {
  const xPosition = getNumber(x, PART_POSITION);
  const yPosition = getNumber(y, PART_POSITION);

  return typeof xPosition === 'undefined' || typeof yPosition === 'undefined' ? NOT_GREATER : xPosition - yPosition;
};

// The final revision has no sequence number and sorts last.
const compareInLivestreamSession: CompareFn = (x, y) =>
  (getNumber(x, STREAM_SEQUENCE) ?? Infinity) - (getNumber(y, STREAM_SEQUENCE) ?? Infinity);

function getPositionInParent(node: Node | undefined, parentId: Identifier): number | undefined {
  return getParentId(node) === parentId ? node?.position : undefined;
}

/**
 * Writes the parts of a parent in the given order: `hasPart` on the parent, `isPartOf` and `position` on the parts.
 * An existing position is kept if it is still increasing, otherwise the part gets `last + 1` if it fits before the next
 * part, or `last + 1000`.
 */
function writeParts(transaction: StoreTransaction, parentId: Identifier, partIds: readonly Identifier[]): void {
  let lastPosition = 0;

  for (const [index, partId] of partIds.entries()) {
    const part = transaction.getNode(partId);

    if (!part) {
      throw new Error(`botframework-webchat: Cannot find part "${partId}" of "${parentId}"`);
    }

    const position = getPositionInParent(part, parentId);
    const nextPartId = partIds[index + 1];
    const nextSiblingPosition = nextPartId && getPositionInParent(transaction.getNode(nextPartId), parentId);

    const nextPosition =
      typeof position !== 'undefined' && position > lastPosition
        ? position
        : nextPartId && typeof nextSiblingPosition !== 'undefined' && lastPosition + 1 <= nextSiblingPosition
          ? lastPosition + 1
          : lastPosition + POSITION_INCREMENT;

    nextPosition === position ||
      transaction.upsertNode(
        withProperties(part, { isPartOf: new Set([Object.freeze({ '@id': parentId })]), position: nextPosition })
      );

    lastPosition = nextPosition;
  }

  const parent = transaction.getNode(parentId);

  if (!parent) {
    throw new Error(`botframework-webchat: Cannot find parent "${parentId}"`);
  }

  transaction.upsertNode(
    withProperties(parent, { hasPart: new Set(partIds.map(partId => Object.freeze({ '@id': partId }))) })
  );
}

/**
 * Places a part in its parent: removes it if present, then inserts it after every part not greater than it.
 * With `keepPlace`, a part already in the parent stays where it is.
 */
function placePart(
  transaction: StoreTransaction,
  parentId: Identifier,
  partId: Identifier,
  compareFn: CompareFn,
  { keepPlace }: { readonly keepPlace: boolean }
): void {
  const getNode = (id: Identifier) => transaction.getNode(id);
  const parts = getOrderedParts(getNode, parentId);
  const part = getNode(partId);

  if (!part) {
    throw new Error(`botframework-webchat: Cannot find part "${partId}"`);
  }

  const nextParts =
    keepPlace && parts.some(({ '@id': id }) => id === partId)
      ? parts
      : insertSorted(
          parts.filter(({ '@id': id }) => id !== partId),
          part,
          compareFn
        );

  writeParts(
    transaction,
    parentId,
    nextParts.map(({ '@id': id }) => id)
  );
}

/** Removes a part from its parent. Returns the ID of the former parent. */
function detachPart(transaction: StoreTransaction, partId: Identifier): Identifier | undefined {
  const part = transaction.getNode(partId);
  const parentId = getParentId(part);
  const parent = parentId && transaction.getNode(parentId);

  if (!part || !parentId || !parent) {
    return undefined;
  }

  transaction.upsertNode(
    withProperties(parent, {
      hasPart: new Set(Array.from(parent.hasPart ?? []).filter(({ '@id': id }) => id !== partId))
    })
  );

  transaction.upsertNode(withProperties(part, { isPartOf: undefined, position: undefined }));

  return parentId;
}

function computeHowToTimestamp(transaction: StoreTransaction, howToId: Identifier): number | undefined {
  return getOrderedParts(id => transaction.getNode(id), howToId).reduce<number | undefined>((max, part) => {
    const logicalTimestamp = getNumber(part, LOGICAL_TIMESTAMP);

    return typeof logicalTimestamp === 'undefined' ? max : Math.max(max ?? -Infinity, logicalTimestamp);
  }, undefined);
}

function ensureNode(transaction: StoreTransaction, id: Identifier, type: string): Node {
  const existingNode = transaction.getNode(id);

  if (existingNode) {
    return existingNode;
  }

  transaction.upsertNode({ '@id': id, '@type': new Set([type]) });

  // Read back the node as stored.
  return transaction.getNode(id) ?? { '@id': id, '@type': new Set([type]) };
}

/**
 * After a part left a parent: an emptied HowTo leaves the conversation, otherwise its timestamp is recomputed in place.
 * Like core's delete, the HowTo is not re-sorted.
 */
function afterPartLeft(transaction: StoreTransaction, formerParentId: Identifier | undefined): void {
  const formerParent = formerParentId && transaction.getNode(formerParentId);

  if (!formerParentId || !formerParent || !hasType(formerParent, HOW_TO_TYPE)) {
    return;
  }

  if (formerParent.hasPart?.size) {
    transaction.upsertNode(
      withProperties(formerParent, {
        [LOGICAL_TIMESTAMP]: toNumberValues(computeHowToTimestamp(transaction, formerParentId))
      })
    );
  } else {
    // QUESTION(William): the store has no delete yet, so the empty HowTo stays in the graph, outside of the tree.
    detachPart(transaction, formerParentId);
  }
}

/** Places a part (message or livestream session) in the conversation, either directly or through its HowTo. */
function placeInConversation(
  transaction: StoreTransaction,
  conversationId: Identifier,
  partId: Identifier,
  howTo: { readonly groupingId: string; readonly position?: number | undefined } | undefined
): void {
  if (!howTo) {
    placePart(transaction, conversationId, partId, compareInConversation, { keepPlace: false });

    return;
  }

  const howToId = getHowToNodeId(howTo.groupingId);

  ensureNode(transaction, howToId, HOW_TO_TYPE);

  // A position-less update keeps its place in the HowTo.
  placePart(transaction, howToId, partId, compareInHowTo, { keepPlace: typeof howTo.position === 'undefined' });

  const howToNode = transaction.getNode(howToId);

  howToNode &&
    transaction.upsertNode(
      withProperties(howToNode, {
        [LOGICAL_TIMESTAMP]: toNumberValues(computeHowToTimestamp(transaction, howToId))
      })
    );

  placePart(transaction, conversationId, howToId, compareInConversation, { keepPlace: false });
}

/**
 * Places a livestream revision in its session, then the session in the conversation (directly or through its HowTo).
 */
function placeLivestreamRevision(
  transaction: StoreTransaction,
  conversationId: Identifier,
  {
    existingSession,
    howTo,
    isNewRevision,
    livestream,
    logicalTimestamp,
    messageId
  }: {
    readonly existingSession: Node | undefined;
    readonly howTo: SafeSortableMessage['howTo'];
    readonly isNewRevision: boolean;
    readonly livestream: NonNullable<SafeSortableMessage['livestream']>;
    readonly logicalTimestamp: number | undefined;
    readonly messageId: Identifier;
  }
): void {
  const sessionId = getLivestreamSessionNodeId(livestream.sessionId);
  const session = ensureNode(transaction, sessionId, LIVESTREAM_SESSION_TYPE);

  // Same as core's fast path: a new interim revision of an existing session outside of a HowTo does not move the session.
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

  placeInConversation(transaction, conversationId, sessionId, howTo);
}

/**
 * Upserts a message into the transcript of a conversation and re-sorts the affected parts, in one transaction.
 *
 * The conversation node is created if missing.
 */
export default function upsertSortedMessage(
  transaction: StoreTransaction,
  conversationId: Identifier,
  sortableMessage: SortableMessage
): void {
  const { howTo, livestream, localTimestamp, logicalTimestamp, node } = parse(sortableMessageSchema, sortableMessage);
  const safeConversationId = parse(identifierSchema, conversationId);
  const messageId = node['@id'];
  const existingMessage = transaction.getNode(messageId);

  const sessionId = livestream && getLivestreamSessionNodeId(livestream.sessionId);
  const existingSession = sessionId && transaction.getNode(sessionId);

  if (existingSession && getBoolean(existingSession, FINALIZED)) {
    console.warn(
      `botframework-webchat: Cannot update livestreaming session ${livestream?.sessionId} because it has been concluded`
    );

    return;
  }

  ensureNode(transaction, safeConversationId, CONVERSATION_TYPE);

  const parentId = sessionId || (howTo ? getHowToNodeId(howTo.groupingId) : safeConversationId);

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
      [STREAM_SEQUENCE]: livestream && !livestream.final ? toNumberValues(livestream.sequenceNumber) : undefined
    })
  );

  livestream
    ? placeLivestreamRevision(transaction, safeConversationId, {
        existingSession,
        howTo,
        isNewRevision: !existingMessage,
        livestream,
        logicalTimestamp,
        messageId
      })
    : placeInConversation(transaction, safeConversationId, messageId, howTo);
}
