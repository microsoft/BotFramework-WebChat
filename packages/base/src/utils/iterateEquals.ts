const MAX_ITERATION = 1_000_000;

export default function iterateEquals<T>(x: Iterable<T>, y: Iterable<T>): boolean {
  const xIterator = x[Symbol.iterator]();
  const yIterator = y[Symbol.iterator]();

  // eslint-disable-next-line no-magic-numbers
  for (let count = 0; count < MAX_ITERATION; count++) {
    const resultX = xIterator.next();
    const resultY = yIterator.next();

    if (resultX.done && resultY.done) {
      return true;
    }

    if (!Object.is(resultX.value, resultY.value)) {
      break;
    }
  }

  return false;
}
