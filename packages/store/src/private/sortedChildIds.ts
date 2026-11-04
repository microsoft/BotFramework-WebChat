import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import type VersionedArray from './VersionedArray.ts';

// Hidden property on the parent node to cache IDs of its children, sorted by `dateCreated`, then `@id`.
const sortedChildIdsSymbol = Symbol('sortedChildIds');

type NodeWithSortedChildIds = Node & { readonly [sortedChildIdsSymbol]?: VersionedArray<Identifier> | undefined };

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
 * Finds the first index which the item is not before the target, i.e. `compareAt(index) >= 0`.
 *
 * Searches from the end of the array: steps are doubled until the target is passed, then binary search.
 * This is O(1) if the target is at the end, otherwise, O(log d), where d is the distance from the end.
 */
function findIndexFromEnd(length: number, compareAt: (index: number) => number): number {
  if (!length || compareAt(length - 1) < 0) {
    return length;
  }

  // `compareAt(high) >= 0` and `compareAt(low) < 0`, -1 is the start of the array.
  let high = length - 1;
  let low = -1;

  for (let step = 1; ; step += step) {
    const probe = high - step;

    if (probe < 0) {
      break;
    } else if (compareAt(probe) < 0) {
      low = probe;

      break;
    }

    high = probe;
  }

  while (high - low > 1) {
    // `low + high` is non-negative as `high - low > 1` and `low >= -1`.
    const middle = (low + high) >> 1;

    compareAt(middle) < 0 ? (low = middle) : (high = middle);
  }

  return high;
}

/**
 * Finds the index of the child, or where the child should be inserted.
 */
function findChildIndex(
  sortedChildIds: VersionedArray<Identifier>,
  id: Identifier,
  dateCreated: number | undefined,
  getDateCreated: (id: Identifier) => number | undefined
): number {
  return findIndexFromEnd(sortedChildIds.length, index => {
    const childId = sortedChildIds.at(index) as Identifier;

    return compareChild([getDateCreated(childId), childId], [dateCreated, id]);
  });
}

/**
 * Inserts a child into the sorted child IDs.
 *
 * Cost is O(log d) to search and O(d) to shift items, where d is the number of children sorted after the new child.
 * Appending to the end (e.g. a new message) is O(1).
 *
 * @param getDateCreated Returns `dateCreated` of existing children.
 */
function insertSortedChild(
  sortedChildIds: VersionedArray<Identifier>,
  id: Identifier,
  dateCreated: number | undefined,
  getDateCreated: (id: Identifier) => number | undefined
): VersionedArray<Identifier> {
  const index = findChildIndex(sortedChildIds, id, dateCreated, getDateCreated);

  return sortedChildIds.splice(index, 0, id);
}

/**
 * Removes a child from the sorted child IDs. Cost is same as `insertSortedChild()`.
 *
 * @param dateCreated `dateCreated` of the child when it was inserted.
 * @param getDateCreated Returns `dateCreated` of existing children when they were inserted.
 */
function removeSortedChild(
  sortedChildIds: VersionedArray<Identifier>,
  id: Identifier,
  dateCreated: number | undefined,
  getDateCreated: (id: Identifier) => number | undefined
): VersionedArray<Identifier> {
  const index = findChildIndex(sortedChildIds, id, dateCreated, getDateCreated);

  if (sortedChildIds.at(index) !== id) {
    throw new Error(`ASSERTION: Child "${id}" is not in the sorted children`);
  }

  return sortedChildIds.splice(index, 1);
}

/**
 * Gets IDs of children sorted by `dateCreated`, then `@id`. Returns `undefined` if the node has no children.
 */
function getSortedChildIds(node: NodeWithSortedChildIds | undefined): VersionedArray<Identifier> | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[sortedChildIdsSymbol];
}

export { getSortedChildIds, insertSortedChild, removeSortedChild, sortedChildIdsSymbol };
