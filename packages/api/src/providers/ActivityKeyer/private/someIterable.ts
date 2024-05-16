export default function someIterable<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): boolean {
  for (const item of iterable) {
    if (predicate(item)) {
      return true;
    }
  }

  return false;
}
