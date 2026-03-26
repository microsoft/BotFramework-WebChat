const EMPTY_ARRAY: readonly any[] = Object.freeze([]);

/** @deprecated Will be removed on or after 2028-03-16. */
export default function singleToArray<T>(singleOrArray: T | readonly T[]): readonly T[] {
  return typeof singleOrArray === 'undefined'
    ? (EMPTY_ARRAY as readonly T[])
    : Object.freeze(Array.isArray(singleOrArray) ? [...singleOrArray] : [singleOrArray]);
}
