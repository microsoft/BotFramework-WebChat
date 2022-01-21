export default function findLastIndex<T>(array: readonly T[], predicate: (value: T, index: number) => boolean): number {
  const index = [...array].reverse().findIndex(predicate);

  if (~index) {
    const { length } = array || [];

    return length - index - 1;
  }

  return index;
}
