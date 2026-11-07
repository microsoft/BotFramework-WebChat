// Is a parts array "flat", i.e. messages only (no HowTo, no livestream session)?
// For the conversation, flat means the displayed list is the parts array itself (no walk needed): the fast path of
// `stampFlatActivityPositions()` and `patchFlatLists()`.
//
// Cached by the (immutable, frozen) parts array of the part index; derived arrays inherit it in O(1).

import type { GetNode, GraphIdentifier, GraphNode } from '../types';
import { HOW_TO_TYPE, LIVESTREAM_SESSION_TYPE } from '../vocabulary';
import { hasType } from './nodeProperties';

const flatCache = new WeakMap<readonly GraphIdentifier[], boolean>();

function isMessageNode(node: GraphNode | undefined): boolean {
  return !!node && !hasType(node, HOW_TO_TYPE) && !hasType(node, LIVESTREAM_SESSION_TYPE);
}

/** O(1) if known, otherwise O(n) once per array. */
function isFlat(partIds: readonly GraphIdentifier[], getNode: GetNode): boolean {
  let flat = flatCache.get(partIds);

  if (typeof flat === 'undefined') {
    flat = partIds.every(id => isMessageNode(getNode(id)));
    flatCache.set(partIds, flat);
  }

  return flat;
}

/** `true`/`false` if known, `undefined` if not computed yet. */
function getKnownFlat(partIds: readonly GraphIdentifier[]): boolean | undefined {
  return flatCache.get(partIds);
}

/** `nextIds` = `prevIds` with `addedId` inserted (or removed if `addedId` is `undefined`), if `prevIds` is known. */
function inheritFlat(
  nextIds: readonly GraphIdentifier[],
  prevIds: readonly GraphIdentifier[],
  addedNode: GraphNode | undefined | null
): void {
  const prevFlat = flatCache.get(prevIds);

  if (typeof prevFlat === 'undefined') {
    return;
  }

  flatCache.set(nextIds, prevFlat && (addedNode === null || isMessageNode(addedNode)));
}

export { getKnownFlat, inheritFlat, isFlat };
