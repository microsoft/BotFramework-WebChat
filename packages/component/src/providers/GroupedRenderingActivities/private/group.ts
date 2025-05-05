import pick from './pick';

export default function group<T>(
  ungrouped: Iterable<T>,
  getItemsOfSameGroup: (item: T) => Iterable<T> | undefined
): readonly (readonly T[])[] {
  let processing: readonly T[] = Array.from(ungrouped);
  const result: (readonly T[])[] = [];

  while (processing.length) {
    const [value] = processing;
    const [left, right] = pick<T>(processing, [value, ...(getItemsOfSameGroup(value) || [])]);

    processing = left;
    result.push(right);
  }

  return Object.freeze(result);
}
