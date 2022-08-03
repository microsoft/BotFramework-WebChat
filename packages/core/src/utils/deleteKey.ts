import isForbiddenPropertyName from './isForbiddenPropertyName';

export default function deleteKey<TMap, TKey extends keyof TMap>(map: TMap, ...keys: TKey[]): Omit<TMap, TKey> {
  if (!map) {
    return map;
  }

  const nextMap = { ...map };

  for (const key of keys) {
    if (typeof key !== 'string' || !isForbiddenPropertyName(key)) {
      // Mitigation through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      delete nextMap[key];
    }
  }

  return nextMap;
}
