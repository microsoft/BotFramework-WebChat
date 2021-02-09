export default function findLastIndex(array, predicate) {
  const index = [...array].reverse().findIndex(predicate);

  if (~index) {
    const { length } = array || [];

    return length - index - 1;
  }

  return index;
}
