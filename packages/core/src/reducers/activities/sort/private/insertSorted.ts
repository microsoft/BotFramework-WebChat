// @ts-ignore No @types/core-js-pure
import { default as toSpliced_ } from 'core-js-pure/features/array/to-spliced.js';

// The Node.js version we are using for CI/CD does not support Array.prototype.toSpliced yet.
function toSpliced<T>(array: readonly T[], start: number, deleteCount: number, ...items: T[]): T[] {
  return toSpliced_(array, start, deleteCount, ...items);
}

/**
 * Inserts a single item into a sorted array.
 *
 * For multiple items, consider other options for efficiency.
 *
 * @param sortedArray A sorted array.
 * @param item Item to be inserted.
 * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise.
 * @returns A new sorted array with the new item.
 */
export default function insertSorted<T>(sortedArray: readonly T[], item: T, compareFn: (x: T, y: T) => number): T[] {
  // TODO: Implements `binaryFindIndex()` for better performance.
  const indexToInsert = sortedArray.findIndex(i => compareFn(i, item) > 0);

  return toSpliced(sortedArray, ~indexToInsert ? indexToInsert : sortedArray.length, 0, item);
}
