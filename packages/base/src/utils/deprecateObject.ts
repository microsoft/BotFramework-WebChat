import warnOnce from './warnOnce';

const PROPERTY_DENYLIST = new Set<string | symbol>([
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  '__proto__',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'prototype',
  'toString',
  'valueOf'
]);

export default function deprecateObject<T extends { [key: string | symbol]: any }>(namespace: T, message: string): T {
  const warnDeprecation = warnOnce(message);

  return new Proxy<T>(namespace, {
    get(target, p) {
      if (
        !PROPERTY_DENYLIST.has(p) &&
        (typeof p === 'string'
          ? Object.getOwnPropertyNames(target).includes(p)
          : Object.getOwnPropertySymbols(target).includes(p))
      ) {
        warnDeprecation(p);

        // Only can get own properties.
        // eslint-disable-next-line security/detect-object-injection
        return target[p];
      }
    }
  });
}
