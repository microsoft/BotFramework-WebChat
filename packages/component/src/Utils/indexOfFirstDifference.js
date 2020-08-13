export default function indexOfFirstDifference(x, y) {
  if ((!x && typeof x !== 'string') || typeof x.length !== 'number') {
    throw new Error(
      'botframework-webchat: The first argument passed to indexOfFirstDifference must be an array-like object.'
    );
  } else if ((!y && typeof y !== 'string') || typeof y.length !== 'number') {
    throw new Error(
      'botframework-webchat: The second argument passed to indexOfFirstDifference must be an array-like object.'
    );
  }

  if (x === y) {
    return -1;
  }

  const minLength = Math.min(x.length, y.length);

  for (let index = 0; index < minLength; index++) {
    if (x[index] !== y[index]) {
      return index;
    }
  }

  return minLength;
}
