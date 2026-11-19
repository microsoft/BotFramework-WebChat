import type { Identifier } from '../node/NodeIdentifier.ts';
import { compareDateCreatedTime, type DateCreatedTime } from './dateCreatedTime.ts';
import type { InternalNode } from './InternalNode.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';
import { type ReadWriteSkipList } from '../structure/FrozenSkipList.ts';

// Hidden property on the parent node to cache IDs of its children, sorted by `dateCreated`, then `@id`.
const sortedChildIdsSymbol = Symbol('sortedChildIds');

type NodeWithSortedChildIds = InternalNode & {
  readonly [sortedChildIdsSymbol]?: FrozenSkipList<Identifier> | undefined;
};

/**
 * Compares two children: earlier `dateCreated` comes first, children without `dateCreated` come last.
 * If `dateCreated` is the same, compares by `@id`.
 */
function compareChild(
  [x, xId]: readonly [DateCreatedTime, Identifier],
  [y, yId]: readonly [DateCreatedTime, Identifier]
): number {
  return compareDateCreatedTime(x, y) || Number(xId > yId) - Number(xId < yId);
}

/**
 * Inserts a child into the sorted child IDs.
 *
 * Appending to the end (e.g. a new message) is O(1), otherwise, expected O(log n). No items are shifted.
 *
 * @param dateCreatedTime Parsed `dateCreated` of the child, see `getPreciseDateCreatedTime()`.
 * @param getDateCreatedTime Returns parsed `dateCreated` of existing children, see `getPreciseDateCreatedTime()`.
 */
function insertSortedChild(
  sortedChildIds: ReadWriteSkipList<Identifier>,
  id: Identifier,
  dateCreatedTime: DateCreatedTime,
  getDateCreatedTime: (id: Identifier) => DateCreatedTime
): void {
  sortedChildIds.insert(id, childId => compareChild([getDateCreatedTime(childId), childId], [dateCreatedTime, id]) > 0);
}

/**
 * Removes a child from the sorted child IDs in expected O(1).
 */
function removeSortedChild(sortedChildIds: ReadWriteSkipList<Identifier>, id: Identifier): void {
  if (!sortedChildIds.delete(id)) {
    throw new Error(`ASSERTION: Child "${id}" is not in the sorted children`);
  }
}

/**
 * Gets IDs of children sorted by `dateCreated`, then `@id`. Returns `undefined` if the node has no children.
 */
function getSortedChildIds(node: NodeWithSortedChildIds | undefined): FrozenSkipList<Identifier> | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[sortedChildIdsSymbol];
}

export { getSortedChildIds, insertSortedChild, removeSortedChild, sortedChildIdsSymbol };
