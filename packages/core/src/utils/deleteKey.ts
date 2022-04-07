export default function deleteKey<TMap, TKey extends keyof TMap>(map: TMap, key: TKey): Omit<TMap, TKey> {
  if (!map) {
    return map;
  }

  const { [key]: _deleted, ...nextMap } = map;

  return nextMap;
}
