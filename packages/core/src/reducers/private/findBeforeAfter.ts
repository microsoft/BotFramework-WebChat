type Position = 'after' | 'before' | 'unknown';

export default function findBeforeAfter<T>(
  array: T[],
  getPosition: (value: T) => Position
): [T | undefined, T | undefined, number | undefined] {
  let lastValue: T | undefined;
  let lastPosition: Position = 'unknown';

  for (let index = 0; index < array.length; index++) {
    const value = array[+index];
    const currentPosition = getPosition(value);

    if (
      ((lastPosition === 'before' || lastPosition === 'unknown') && currentPosition === 'after') ||
      (lastPosition === 'before' && (currentPosition === 'after' || currentPosition === 'unknown'))
    ) {
      return [lastValue, value, index];
    }

    lastValue = value;
    lastPosition = currentPosition;
  }

  if (lastPosition === 'before') {
    return [lastValue, undefined, array.length];
  }

  return [undefined, undefined, undefined];
}
