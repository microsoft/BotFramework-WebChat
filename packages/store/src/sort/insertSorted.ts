/**
 * Inserts a single item into a sorted array, after every item that is not greater than it.
 *
 * Ties and items the compare function cannot order (it returns a non-positive value) keep arrival order.
 *
 * Ported from `packages/core/src/reducers/activities/sort/private/insertSorted.ts`.
 *
 * @param sortedArray A sorted array.
 * @param item Item to be inserted.
 * @param compareFn Returns a positive value if the first argument is greater than the second argument.
 * @returns A new sorted array with the new item.
 */
export default function insertSorted<T>(
  sortedArray: readonly T[],
  item: T,
  compareFn: (x: T, y: T) => number
): readonly T[] {
  const indexToInsert = sortedArray.findIndex(existing => compareFn(existing, item) > 0);

  return Object.freeze(
    ~indexToInsert
      ? [...sortedArray.slice(0, indexToInsert), item, ...sortedArray.slice(indexToInsert)]
      : [...sortedArray, item]
  );
}
