export default function singleToArray<T>(singleOrArray: T | T[]): T[] {
  return singleOrArray ? (Array.isArray(singleOrArray) ? singleOrArray : [singleOrArray]) : [];
}
