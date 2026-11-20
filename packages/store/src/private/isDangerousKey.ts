/**
 * Keys which could be used for prototype pollution, they are skipped when copying an object.
 *
 * Validated value could contain them as own properties, e.g. `JSON.parse('{"__proto__":{}}')`.
 */
const DANGEROUS_KEYS: ReadonlySet<string> = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

/** Checks if the key could be used for prototype pollution, e.g. `__proto__`, `constructor`, and `prototype`. */
function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

export default isDangerousKey;
