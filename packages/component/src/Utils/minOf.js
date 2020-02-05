function isUndefined(obj) {
  return typeof obj === 'undefined';
}

const DEFAULT_SELECTOR = value => value;

function minOf(array, selector = DEFAULT_SELECTOR) {
  return array.reduce((minValue, value) => {
    const minScore = isUndefined(minValue) ? minValue : selector(minValue);
    const score = isUndefined(value) ? value : selector(value);

    if (isUndefined(minScore)) {
      return value;
    } else if (isUndefined(score)) {
      return minValue;
    }

    return minScore < score ? minValue : value;
  }, undefined);
}

function map(map, selector = DEFAULT_SELECTOR) {
  return minOf(
    Object.entries(map).map(entry => (isUndefined(entry[1]) ? undefined : entry)),
    ([key, value]) => selector.call(map, value, key)
  );
}

export default minOf;

export { map };
