const DANGEROUS_PROPERTY_NAMES = ['__proto__', 'constructor', 'prototype'];

/**
 * Returns an allowlisted own-property names.
 *
 * If `null` or `undefined` is passed, an empty list will be returned.
 *
 * @param object An object (including primitives).
 * @returns An allowlisted own-property names.
 */
export default function getSafeOwnPropertyNames(object: unknown): string[] {
  return Object.getOwnPropertyNames(object).filter(name => !DANGEROUS_PROPERTY_NAMES.includes(name));
}
