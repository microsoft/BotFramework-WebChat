import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import type VersionedSkipList from './VersionedSkipList.ts';

// Hidden property on the parent node to cache IDs of its children, sorted by `dateCreated`, then `@id`.
const sortedChildIdsSymbol = Symbol('sortedChildIds');

type NodeWithSortedChildIds = Node & { readonly [sortedChildIdsSymbol]?: VersionedSkipList<Identifier> | undefined };

/**
 * Compares two children: earlier `dateCreated` comes first, children without `dateCreated` come last.
 * If `dateCreated` is the same, compares by `@id`.
 */
function compareChild(
  [xDateCreated, xId]: readonly [number | undefined, Identifier],
  [yDateCreated, yId]: readonly [number | undefined, Identifier]
): number {
  const x = xDateCreated ?? Infinity;
  const y = yDateCreated ?? Infinity;

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
  sortedChildIds: VersionedSkipList<Identifier>,
  id: Identifier,
  dateCreated: number | undefined,
  getDateCreated: (id: Identifier) => number | undefined
): VersionedSkipList<Identifier> {
  return sortedChildIds.insert(id, childId => compareChild([getDateCreated(childId), childId], [dateCreated, id]) > 0);
}

/**
 * Removes a child from the sorted child IDs in expected O(1).
 */
function removeSortedChild(
  sortedChildIds: VersionedSkipList<Identifier>,
  id: Identifier
): VersionedSkipList<Identifier> {
  if (!sortedChildIds.has(id)) {
    throw new Error(`ASSERTION: Child "${id}" is not in the sorted children`);
  }

  return sortedChildIds.delete(id);
}

/**
 * Gets IDs of children sorted by `dateCreated`, then `@id`. Returns `undefined` if the node has no children.
 */
function getSortedChildIds(node: NodeWithSortedChildIds | undefined): VersionedSkipList<Identifier> | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[sortedChildIdsSymbol];
}

export { getSortedChildIds, insertSortedChild, removeSortedChild, sortedChildIdsSymbol };
