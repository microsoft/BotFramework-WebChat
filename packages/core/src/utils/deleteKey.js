export default function deleteKey(map, key) {
  if (!map) {
    return map;
  }

  const { [key]: _deleted, ...nextMap } = map;

  return nextMap;
}
