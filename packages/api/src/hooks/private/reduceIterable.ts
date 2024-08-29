export default function reduceIterable<T, U>(
  iterable: Iterable<T>,
  reducer: (intermediate: U, item: T) => U,
  initial: U
): U {
  let intermediate = initial;

  for (const item of iterable) {
    intermediate = reducer(intermediate, item);
  }

  return intermediate;
}
