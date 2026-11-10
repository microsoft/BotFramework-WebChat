/**
 * Inserts a single item into a sorted array, returns a new array. The item is inserted before the first item which
 * `compareFn(item, newItem)` is positive, or appended to the end.
 */
function insertSorted<T>(sortedArray: readonly T[], item: T, compareFn: (x: T, y: T) => number): T[] {
  const index = sortedArray.findIndex(existingItem => compareFn(existingItem, item) > 0);

  // Spread instead of `slice()`, `slice()` on frozen array is slow.
  const nextSortedArray = [...sortedArray];

  nextSortedArray.splice(~index ? index : sortedArray.length, 0, item);

  return nextSortedArray;
}

export default insertSorted;
