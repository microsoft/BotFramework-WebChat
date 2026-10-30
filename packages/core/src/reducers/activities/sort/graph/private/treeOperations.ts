import type { GraphIdentifier, GraphNode } from '../types';
import { HOW_TO_TYPE, IDENTIFIER, LOGICAL_TIMESTAMP } from '../vocabulary';
import { getNumber, getParentId, hasType, toNumberValues, withProperties } from './nodeProperties';
import { getSortKeys, setSortKeys, toSortKey, type SortKey } from './sortKeys';
import type WorkingGraph from './WorkingGraph';

// The transcript is a tree of `isPartOf` links: Conversation → (Message | livestream session | HowTo),
// HowTo → (Message | livestream session), livestream session → Message revisions.
// Every part has a `position` relative to its parent, strictly increasing in display order.
//
// Core writes `isPartOf` only. `OPINIONS.md` says the store auto-inverses `hasPart`/`isPartOf` (a TODO in `Store.ts`);
// writing `hasPart` ourselves meant re-validating a set that grows with the transcript on every action.
//
// Like `upsert.ts` before, every level is an insertion sort: arrival order decides ties and parts without sort keys.
// A stateless sort over a snapshot cannot reproduce this, so positions are written at upsert time.

const POSITION_INCREMENT = 1_000;

/**
 * "Is `x` greater than `part`", on sort keys. Same results as the compare functions of `upsert.ts` (`> 0`).
 */
type IsGreater = (x: SortKey, part: SortKey) => boolean;

type HowToPlacement = {
  readonly groupingId: string;
  readonly howToId: GraphIdentifier;
  readonly position: number | undefined;
};

// Compare logical timestamps if both have them, otherwise local timestamps if both are messages and have them
// (`localTimestamp` is only set on messages). Otherwise "not greater", which keeps arrival order.
const isGreaterInConversation: IsGreater = (x, part) =>
  typeof x.logicalTimestamp !== 'undefined' && typeof part.logicalTimestamp !== 'undefined'
    ? x.logicalTimestamp - part.logicalTimestamp > 0
    : typeof x.localTimestamp !== 'undefined' &&
      typeof part.localTimestamp !== 'undefined' &&
      x.localTimestamp - part.localTimestamp > 0;

const isGreaterInHowTo: IsGreater = (x, part) =>
  typeof x.partPosition !== 'undefined' &&
  typeof part.partPosition !== 'undefined' &&
  x.partPosition - part.partPosition > 0;

// The final revision has no sequence number and sorts last.
const isGreaterInLivestreamSession: IsGreater = (x, part) => x.streamSequence - part.streamSequence > 0;

function getPositionInParent(node: GraphNode | undefined, parentId: GraphIdentifier): number | undefined {
  return getParentId(node) === parentId ? node?.position : undefined;
}

function getRequiredNode(working: WorkingGraph, id: GraphIdentifier): GraphNode {
  const node = working.getNode(id);

  if (!node) {
    throw new Error(`botframework-webchat: Cannot find node "${id}" in the activities graph`);
  }

  return node;
}

/**
 * Writes the parts of a parent in the given order: `isPartOf` and `position` on the parts, and the part index.
 * An existing position is kept if it is still increasing, otherwise the part gets `last + 1` if it fits before the next
 * part, or `last + 1000` (the same rule as `upsert.ts` used for `webchat:internal:position`).
 *
 * Parts before `fromIndex` are in order already. Renumbering stops at the first kept position after `fromIndex`: the
 * parts after it were in order before and still are (same result as renumbering the whole list).
 */
function writeParts(
  working: WorkingGraph,
  parentId: GraphIdentifier,
  partIds: readonly GraphIdentifier[],
  fromIndex: number
): void {
  let lastPosition =
    (fromIndex && getPositionInParent(working.getNode(partIds[fromIndex - 1] ?? parentId), parentId)) || 0;

  for (let index = fromIndex; index < partIds.length; index++) {
    // eslint-disable-next-line security/detect-object-injection
    const part = getRequiredNode(working, partIds[index] ?? parentId);
    const position = getPositionInParent(part, parentId);
    const nextPartId = partIds[index + 1];
    const nextSiblingPosition = nextPartId && getPositionInParent(working.getNode(nextPartId), parentId);

    if (typeof position !== 'undefined' && position > lastPosition) {
      if (index > fromIndex) {
        break;
      }

      lastPosition = position;

      continue;
    }

    const nextPosition =
      nextPartId && typeof nextSiblingPosition !== 'undefined' && lastPosition + 1 <= nextSiblingPosition
        ? lastPosition + 1
        : lastPosition + POSITION_INCREMENT;

    working.setNode(
      withProperties(part, { isPartOf: new Set([Object.freeze({ '@id': parentId })]), position: nextPosition })
    );

    lastPosition = nextPosition;
  }

  working.setParts(parentId, partIds);
}

/**
 * Places a part in its parent: removes it if present, then inserts it before the first part greater than it (the same
 * as `insertSorted()`). With `keepPlace`, a part already in the parent stays where it is.
 */
function placePart(
  working: WorkingGraph,
  parentId: GraphIdentifier,
  partId: GraphIdentifier,
  isGreater: IsGreater,
  { keepPlace }: { readonly keepPlace: boolean }
): void {
  const partIds = working.getParts(parentId);
  const currentIndex = partIds.indexOf(partId);

  if (keepPlace && ~currentIndex) {
    writeParts(working, parentId, partIds, currentIndex);

    return;
  }

  const getNode = (id: GraphIdentifier) => getRequiredNode(working, id);
  const partKey = toSortKey(getNode(partId));
  const nextPartIds = partIds.slice();
  const nextKeys = getSortKeys(partIds, getNode).slice();

  if (~currentIndex) {
    nextPartIds.splice(currentIndex, 1);
    nextKeys.splice(currentIndex, 1);
  }

  const greaterIndex = nextKeys.findIndex(key => isGreater(key, partKey));
  const insertIndex = ~greaterIndex ? greaterIndex : nextKeys.length;

  nextPartIds.splice(insertIndex, 0, partId);
  nextKeys.splice(insertIndex, 0, partKey);

  writeParts(working, parentId, nextPartIds, insertIndex);

  // `writeParts()` stores `nextPartIds` as is (frozen): its keys are the ones spliced here.
  setSortKeys(working.getParts(parentId), nextKeys);
}

/** Removes a part from its parent. Returns the ID of the former parent. */
function detachPart(working: WorkingGraph, partId: GraphIdentifier): GraphIdentifier | undefined {
  const part = working.getNode(partId);
  const parentId = getParentId(part);

  if (!part || !parentId) {
    return undefined;
  }

  working.setParts(
    parentId,
    working.getParts(parentId).filter(id => id !== partId)
  );
  working.setNode(withProperties(part, { isPartOf: undefined, position: undefined }));

  return parentId;
}

function computeHowToTimestamp(working: WorkingGraph, howToId: GraphIdentifier): number | undefined {
  return working.getParts(howToId).reduce<number | undefined>((max, partId) => {
    const logicalTimestamp = getNumber(working.getNode(partId), LOGICAL_TIMESTAMP);

    return typeof logicalTimestamp === 'undefined' ? max : Math.max(max ?? -Infinity, logicalTimestamp);
  }, undefined);
}

/** Recomputes the timestamp of a HowTo in place, without moving it (as `deleteActivityByLocalId.ts` did). */
function refreshHowToTimestamp(working: WorkingGraph, howToId: GraphIdentifier): void {
  const howTo = getRequiredNode(working, howToId);
  const logicalTimestamp = computeHowToTimestamp(working, howToId);

  getNumber(howTo, LOGICAL_TIMESTAMP) === logicalTimestamp ||
    working.setNode(withProperties(howTo, { [LOGICAL_TIMESTAMP]: toNumberValues(logicalTimestamp) }));
}

/** Creates the node if missing. `identifier` keeps the sender's ID of a grouping or session. */
function ensureNode(
  working: WorkingGraph,
  id: GraphIdentifier,
  type: string,
  identifier?: string | undefined
): GraphNode {
  working.getNode(id) ||
    working.setNode({
      '@id': id,
      '@type': new Set([type]),
      ...(typeof identifier === 'undefined' ? {} : { [IDENTIFIER]: [identifier] })
    });

  return getRequiredNode(working, id);
}

/**
 * After a part left a parent: an emptied HowTo leaves the conversation, otherwise its timestamp is recomputed in place.
 * Like core's delete, the HowTo is not re-sorted.
 */
function afterPartLeft(working: WorkingGraph, formerParentId: GraphIdentifier | undefined): void {
  if (!formerParentId || !hasType(working.getNode(formerParentId), HOW_TO_TYPE)) {
    return;
  }

  if (working.getParts(formerParentId).length) {
    refreshHowToTimestamp(working, formerParentId);
  } else {
    // QUESTION(William): the store has no delete, so the empty HowTo stays in the graph, outside of the tree.
    detachPart(working, formerParentId);
  }
}

/** Places a part (message or livestream session) in the conversation, either directly or through its HowTo. */
function placeInConversation(
  working: WorkingGraph,
  conversationId: GraphIdentifier,
  partId: GraphIdentifier,
  howToPlacement: HowToPlacement | undefined
): void {
  if (!howToPlacement) {
    placePart(working, conversationId, partId, isGreaterInConversation, { keepPlace: false });

    return;
  }

  const { groupingId, howToId, position } = howToPlacement;

  ensureNode(working, howToId, HOW_TO_TYPE, groupingId);

  // A position-less update keeps its place in the HowTo.
  placePart(working, howToId, partId, isGreaterInHowTo, { keepPlace: typeof position === 'undefined' });
  refreshHowToTimestamp(working, howToId);
  placePart(working, conversationId, howToId, isGreaterInConversation, { keepPlace: false });
}

export {
  afterPartLeft,
  detachPart,
  ensureNode,
  getRequiredNode,
  isGreaterInLivestreamSession,
  placeInConversation,
  placePart,
  refreshHowToTimestamp,
  type HowToPlacement
};
