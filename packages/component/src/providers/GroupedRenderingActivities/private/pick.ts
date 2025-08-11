export default function pick<T>(array: Iterable<T>, pick: Iterable<T>): readonly [readonly T[], readonly T[]] {
  if (!pick) {
    return Object.freeze([Object.freeze(Array.from(array)), Object.freeze([])]);
  }

  const pickArray = Array.from(pick);

  const [left, right] = Array.from(array).reduce(
    ([left, right], item) => {
      if (pickArray.includes(item)) {
        right.push(item);
      } else {
        left.push(item);
      }

      return [left, right];
    },
    [[], []]
  );

  return Object.freeze([Object.freeze(left), Object.freeze(right)]);
}
