import insertSorted from '../../private/insertSorted';
import type { GraphIdentifier, GraphNode, GraphTransaction } from '../types';
import {
  HOW_TO_TYPE,
  IDENTIFIER,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from '../vocabulary';
import getOrderedParts from './getOrderedParts';
import { getNumber, getParentId, hasType, toNumberValues, withProperties } from './nodeProperties';

// The transcript is a tree of `hasPart`/`isPartOf`: Conversation → (Message | livestream session | HowTo),
// HowTo → (Message | livestream session), livestream session → Message revisions.
// Every part has a `position` relative to its parent, strictly increasing in display order.
//
// Like `upsert.ts` before, every level is an insertion sort: arrival order decides ties and parts without sort keys.
// A stateless sort over a snapshot cannot reproduce this, so positions are written at upsert time.

const POSITION_INCREMENT = 1_000;

/** Compare result meaning "not greater": the new part goes after it, which keeps arrival order. */
const NOT_GREATER = -1;

type CompareFn = (x: GraphNode, y: GraphNode) => number;

type HowToPlacement = { readonly howToId: GraphIdentifier; readonly position: number | undefined };

function isMessage(node: GraphNode): boolean {
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

function getPositionInParent(node: GraphNode | undefined, parentId: GraphIdentifier): number | undefined {
  return getParentId(node) === parentId ? node?.position : undefined;
}

function getRequiredNode(transaction: GraphTransaction, id: GraphIdentifier): GraphNode {
  const node = transaction.getNode(id);

  if (!node) {
    throw new Error(`botframework-webchat: Cannot find node "${id}" in the activities graph`);
  }

  return node;
}

/**
 * Writes the parts of a parent in the given order: `hasPart` on the parent, `isPartOf` and `position` on the parts.
 * An existing position is kept if it is still increasing, otherwise the part gets `last + 1` if it fits before the next
 * part, or `last + 1000` (the same rule as `upsert.ts` used for `webchat:internal:position`).
 */
function writeParts(
  transaction: GraphTransaction,
  parentId: GraphIdentifier,
  partIds: readonly GraphIdentifier[]
): void {
  let lastPosition = 0;

  for (const [index, partId] of partIds.entries()) {
    const part = getRequiredNode(transaction, partId);
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

  transaction.upsertNode(
    withProperties(getRequiredNode(transaction, parentId), {
      hasPart: new Set(partIds.map(partId => Object.freeze({ '@id': partId })))
    })
  );
}

/**
 * Places a part in its parent: removes it if present, then inserts it after every part not greater than it.
 * With `keepPlace`, a part already in the parent stays where it is.
 */
function placePart(
  transaction: GraphTransaction,
  parentId: GraphIdentifier,
  partId: GraphIdentifier,
  compareFn: CompareFn,
  { keepPlace }: { readonly keepPlace: boolean }
): void {
  const parts = getOrderedParts(id => transaction.getNode(id), parentId);
  const part = getRequiredNode(transaction, partId);

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
function detachPart(transaction: GraphTransaction, partId: GraphIdentifier): GraphIdentifier | undefined {
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

function computeHowToTimestamp(transaction: GraphTransaction, howToId: GraphIdentifier): number | undefined {
  return getOrderedParts(id => transaction.getNode(id), howToId).reduce<number | undefined>((max, part) => {
    const logicalTimestamp = getNumber(part, LOGICAL_TIMESTAMP);

    return typeof logicalTimestamp === 'undefined' ? max : Math.max(max ?? -Infinity, logicalTimestamp);
  }, undefined);
}

/** Recomputes the timestamp of a HowTo in place, without moving it (as `deleteActivityByLocalId.ts` did). */
function refreshHowToTimestamp(transaction: GraphTransaction, howToId: GraphIdentifier): void {
  transaction.upsertNode(
    withProperties(getRequiredNode(transaction, howToId), {
      [LOGICAL_TIMESTAMP]: toNumberValues(computeHowToTimestamp(transaction, howToId))
    })
  );
}

/** Creates the node if missing. `identifier` keeps the sender's ID of a grouping or session. */
function ensureNode(
  transaction: GraphTransaction,
  id: GraphIdentifier,
  type: string,
  identifier?: string | undefined
): GraphNode {
  transaction.getNode(id) ||
    transaction.upsertNode({
      '@id': id,
      '@type': new Set([type]),
      ...(typeof identifier === 'undefined' ? {} : { [IDENTIFIER]: [identifier] })
    });

  return getRequiredNode(transaction, id);
}

/**
 * After a part left a parent: an emptied HowTo leaves the conversation, otherwise its timestamp is recomputed in place.
 * Like core's delete, the HowTo is not re-sorted.
 */
function afterPartLeft(transaction: GraphTransaction, formerParentId: GraphIdentifier | undefined): void {
  const formerParent = formerParentId && transaction.getNode(formerParentId);

  if (!formerParentId || !formerParent || !hasType(formerParent, HOW_TO_TYPE)) {
    return;
  }

  if (formerParent.hasPart?.size) {
    refreshHowToTimestamp(transaction, formerParentId);
  } else {
    // QUESTION(William): the store has no delete, so the empty HowTo stays in the graph, outside of the tree.
    detachPart(transaction, formerParentId);
  }
}

/** Places a part (message or livestream session) in the conversation, either directly or through its HowTo. */
function placeInConversation(
  transaction: GraphTransaction,
  conversationId: GraphIdentifier,
  partId: GraphIdentifier,
  howToPlacement: (HowToPlacement & { readonly groupingId: string }) | undefined
): void {
  if (!howToPlacement) {
    placePart(transaction, conversationId, partId, compareInConversation, { keepPlace: false });

    return;
  }

  const { groupingId, howToId, position } = howToPlacement;

  ensureNode(transaction, howToId, HOW_TO_TYPE, groupingId);

  // A position-less update keeps its place in the HowTo.
  placePart(transaction, howToId, partId, compareInHowTo, { keepPlace: typeof position === 'undefined' });
  refreshHowToTimestamp(transaction, howToId);
  placePart(transaction, conversationId, howToId, compareInConversation, { keepPlace: false });
}

export {
  afterPartLeft,
  compareInLivestreamSession,
  detachPart,
  ensureNode,
  getRequiredNode,
  placeInConversation,
  placePart,
  refreshHowToTimestamp,
  type HowToPlacement
};
