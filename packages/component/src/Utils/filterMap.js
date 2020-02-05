function filterMap(map, predicate) {
  return Object.entries(map).reduce((nextMap, [key, value]) => {
    if (predicate.call(map, value, key)) {
      nextMap[key] = value;
    }

    return nextMap;
  }, {});
}

export default filterMap;
