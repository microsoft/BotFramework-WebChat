import updateIn from 'simple-update-in';

function filterMap(map, predicate) {
  return Object.entries(map).reduce((nextMap, [key, value]) => {
    if (!predicate.call(map, value, key)) {
      nextMap = updateIn(nextMap, [key]);
    }

    return nextMap;
  }, map);
}

export default filterMap;
