function freezeArray<T>(array: [T]): readonly [T];
function freezeArray<T1, T2>(array: [T1, T2]): readonly [T1, T2];
function freezeArray<T1, T2, T3>(array: [T1, T2, T3]): readonly [T1, T2, T3];
function freezeArray<T1, T2, T3, T4>(array: [T1, T2, T3, T4]): readonly [T1, T2, T3, T4];
function freezeArray<T1, T2, T3, T4, T5>(array: [T1, T2, T3, T4, T5]): readonly [T1, T2, T3, T4, T5];
function freezeArray<T>(array: T[]): readonly T[];

/**
 * This is same as `Object.freeze` with improved typing for typed arrays.
 *
 * In TypeScript, `Object.freeze([1])` is `number[]`.
 *
 * Instead, `freezeArray([1])` is `[number]` and supports up to 5 elements in the array.
 */
function freezeArray<T>(array: T[]): readonly T[] {
  return Object.freeze(array);
}

export default freezeArray;
