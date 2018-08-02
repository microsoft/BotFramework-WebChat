export default function (map, key) {
  const { [key]: deleted, ...nextMap } = map;

  return nextMap;
}
