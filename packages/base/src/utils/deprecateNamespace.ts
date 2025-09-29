import warnOnce from './warnOnce';

const PROPERTY_DENYLIST = new Set<string | symbol>([
  '__defineGetter__',
  '__defineSetter__',
  '__proto__',
  'constructor',
  'hasOwnProperty',
  'prototype',
  'toString',
  'valueOf'
]);

export default function deprecateNamespace<T extends { [key: string | symbol]: any }>(
  namespace: T,
  message: string
): T {
  const warnDeprecation = warnOnce(message);

  return new Proxy<T>(namespace, {
    get(target, p) {
      if (PROPERTY_DENYLIST.has(p)) {
        return undefined;
      }

      warnDeprecation(p);

      // Denylisted dangerous properties.
      // eslint-disable-next-line security/detect-object-injection
      return target[p];
    }
  });
}
