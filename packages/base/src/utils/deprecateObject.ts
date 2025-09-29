import warnOnce from './warnOnce';

export default function deprecateNamespace<T extends { [key: string | symbol]: any }>(
  namespace: T,
  message: string
): T {
  const warnDeprecation = warnOnce(message);

  return new Proxy<T>(namespace, {
    get(target, p) {
      if (
        typeof p === 'string'
          ? Object.getOwnPropertyNames(target).includes(p)
          : Object.getOwnPropertySymbols(target).includes(p)
      ) {
        warnDeprecation(p);

        // Only can get own properties.
        // eslint-disable-next-line security/detect-object-injection
        return target[p];
      }
    }
  });
}
