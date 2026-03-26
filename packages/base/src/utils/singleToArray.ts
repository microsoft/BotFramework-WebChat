const EMPTY_ARRAY: readonly any[] = Object.freeze([]);

export default function singleToArray(singleOrArray: undefined): readonly never[];
export default function singleToArray<T>(singleOrArray: T | T[]): readonly T[];

/** @deprecated Will be removed on or after 2028-03-16. */
export default function singleToArray<T>(singleOrArray: T | T[]): readonly T[] {
  return typeof singleOrArray === 'undefined'
    ? EMPTY_ARRAY
    : Object.freeze(Array.isArray(singleOrArray) ? [...singleOrArray] : [singleOrArray]);
}
