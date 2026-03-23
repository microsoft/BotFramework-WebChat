/** @deprecated Will be removed on or after 2028-03-18. */
export default function singleToArray<T>(singleOrArray: T | T[]): T[];
/** @deprecated Will be removed on or after 2028-03-18. */
export default function singleToArray<T>(singleOrArray: T | readonly T[]): readonly T[];

/** @deprecated Will be removed on or after 2028-03-18. */
export default function singleToArray<T>(singleOrArray: T | T[]): T[] {
  return singleOrArray ? (Array.isArray(singleOrArray) ? [...singleOrArray] : [singleOrArray]) : [];
}
