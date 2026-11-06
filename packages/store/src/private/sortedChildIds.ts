import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import type { ReadWriteSkipList, VersionedReadonlySkipList } from '../structure/createReadonlySkipList.ts';

// Hidden property on the parent node to cache IDs of its children, sorted by `dateCreated`, then `@id`.
const sortedChildIdsSymbol = Symbol('sortedChildIds');

type NodeWithSortedChildIds = Node & {
  readonly [sortedChildIdsSymbol]?: VersionedReadonlySkipList<Identifier> | undefined;
};

/**
 * Converts `dateCreated` (ISO timestamp string) to epoch time for comparison as `Date`, `Infinity` if not set.
 *
 * ISO timestamps with different time zones (e.g. `+02:00` and `Z`) cannot be compared as string.
 */
function toTime(dateCreated: string | undefined): number {
  return typeof dateCreated === 'string' ? new Date(dateCreated).getTime() : Infinity;
}

/**
 * Compares two children: earlier `dateCreated` comes first, children without `dateCreated` come last.
 * If `dateCreated` is the same, compares by `@id`.
 */
function compareChild(
  [xDateCreated, xId]: readonly [string | undefined, Identifier],
  [yDateCreated, yId]: readonly [string | undefined, Identifier]
): number {
  const x = toTime(xDateCreated);
  const y = toTime(yDateCreated);

  return x === y ? Number(xId > yId) - Number(xId < yId) : Number(x > y) - Number(x < y);
}

/**
 * Inserts a child into the sorted child IDs.
 *
 * Appending to the end (e.g. a new message) is O(1), otherwise, expected O(log n). No items are shifted.
 *
 * @param getDateCreated Returns `dateCreated` of existing children.
 */
function insertSortedChild(
  sortedChildIds: ReadWriteSkipList<Identifier>,
  id: Identifier,
  dateCreated: string | undefined,
  getDateCreated: (id: Identifier) => string | undefined
): void {
  sortedChildIds.insert(id, childId => compareChild([getDateCreated(childId), childId], [dateCreated, id]) > 0);
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
function getSortedChildIds(
  node: NodeWithSortedChildIds | undefined
): VersionedReadonlySkipList<Identifier> | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[sortedChildIdsSymbol];
}

export { getSortedChildIds, insertSortedChild, removeSortedChild, sortedChildIdsSymbol };
