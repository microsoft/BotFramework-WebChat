export default function deleteKey<T>(map: T, key: keyof T): Omit<T, keyof T> {
  if (!map) {
    return map;
  }

  const { [key]: _deleted, ...nextMap } = map;

  return nextMap;
}
