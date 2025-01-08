export default function lastOf<T>(array: readonly T[] | undefined): T | undefined {
  return array?.[array.length - 1];
}
