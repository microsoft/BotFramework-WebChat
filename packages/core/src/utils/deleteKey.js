export default function (map, key) {
  if (!map) { return map; }

  const { [key]: deleted, ...nextMap } = map;

  return nextMap;
}
