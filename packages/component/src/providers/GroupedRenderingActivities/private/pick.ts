export default function pick<T>(array: Iterable<T>, pick: Iterable<T>): readonly [readonly T[], readonly T[]] {
  if (!pick) {
    return Object.freeze([Object.freeze(Array.from(array)), Object.freeze([])]);
  }

  const pickArray = Array.from(pick);

  const left: T[] = [];
  const right: T[] = [];

  for (const item of Array.from(array)) {
    if (pickArray.includes(item)) {
      right.push(item);
    } else {
      left.push(item);
    }
  }

  return Object.freeze([Object.freeze(left), Object.freeze(right)]);
}
