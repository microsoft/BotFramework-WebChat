import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import { type ReadWriteSkipList } from '../structure/FrozenSkipList.ts';

/**
 * Compares two children: earlier `dateCreated` comes first, children without `dateCreated` come last.
 * If `dateCreated` is the same, compares by `@id`.
 */
function compareChild(x: number, xId: NodeIdentifier, y: number, yId: NodeIdentifier): number {
  return x === y ? Number(xId > yId) - Number(xId < yId) : Number(x > y) - Number(x < y);
}

/**
 * Inserts a child into the sorted child IDs.
 *
 * Appending to the end (e.g. a new message) is O(1), otherwise, expected O(log n). No items are shifted.
 *
 * @param dateCreatedTime `dateCreated` of the child as epoch time, `Infinity` if not set, see `getDateCreatedTime()`.
 * @param getDateCreatedTime Returns `dateCreated` of existing children as epoch time, see `getDateCreatedTime()`.
 */
function insertSortedChild(
  sortedChildIds: ReadWriteSkipList<NodeIdentifier>,
  id: NodeIdentifier,
  dateCreatedTime: number,
  getDateCreatedTime: (id: NodeIdentifier) => number
): void {
  sortedChildIds.insert(id, childId => compareChild(getDateCreatedTime(childId), childId, dateCreatedTime, id) > 0);
}

/**
 * Removes a child from the sorted child IDs in expected O(1).
 */
function removeSortedChild(sortedChildIds: ReadWriteSkipList<NodeIdentifier>, id: NodeIdentifier): void {
  if (!sortedChildIds.delete(id)) {
    throw new Error(`ASSERTION: Child "${id}" is not in the sorted children`);
  }
}

export { insertSortedChild, removeSortedChild };
