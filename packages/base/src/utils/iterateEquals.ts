const MAX_ITERATION = 1_000_000;

export default function iterateEquals<T>(x: Iterable<T>, y: Iterable<T>): boolean {
  const xIterator = x[Symbol.iterator]();
  const yIterator = y[Symbol.iterator]();

  if (Object.is(xIterator, yIterator)) {
    throw new Error('Must not pass same instance twice');
  }

  // eslint-disable-next-line no-magic-numbers
  for (let count = 0; count < MAX_ITERATION; count++) {
    const resultX = xIterator.next();
    const resultY = yIterator.next();

    const { done: xDone } = resultX;
    const { done: yDone } = resultY;

    if (xDone && yDone) {
      return true;
    } else if (xDone || yDone || !Object.is(resultX.value, resultY.value)) {
      break;
    }
  }

  return false;
}
