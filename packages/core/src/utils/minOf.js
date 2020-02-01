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
  const minKey = minOf(Object.keys(map), key => selector.call(map, map[key], key));

  return minKey && map[minKey];
}

export default minOf;

export { map };
