/** `toJSONValue()` with the ancestors of the value (to leave out recursion). `undefined` = left out. */
function toJSONValueWithAncestors(value: unknown, key: string, ancestors: Set<object>): unknown {
  const jsonValue =
    value && typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function'
      ? value.toJSON(key)
      : value;

  if (typeof jsonValue === 'string' || typeof jsonValue === 'boolean') {
    return jsonValue;
  } else if (typeof jsonValue === 'number') {
    return Number.isFinite(jsonValue) ? jsonValue : null;
  } else if (!jsonValue || typeof jsonValue !== 'object') {
    // `bigint`, function, symbol, `undefined`; `null` stays `null`.
    return jsonValue === null ? null : undefined;
  } else if (ancestors.has(jsonValue)) {
    return undefined;
  }

  ancestors.add(jsonValue);

  const projection = Array.isArray(jsonValue)
    ? jsonValue.map((item, index) => toJSONValueWithAncestors(item, `${index}`, ancestors) ?? null)
    : Object.fromEntries(
        Object.entries(jsonValue).flatMap(([name, item]) => {
          const jsonItem = toJSONValueWithAncestors(item, name, ancestors);

          return typeof jsonItem === 'undefined' ? [] : [[name, jsonItem]];
        })
      );

  ancestors.delete(jsonValue);

  return Object.freeze(projection);
}

/**
 * The JSON projection of a value, as `JSON.parse(JSON.stringify(value))` would give, deeply frozen. Never throws for a
 * host's value (unless its `toJSON()` throws).
 *
 * The store only holds JSON (plain objects, arrays, strings, finite numbers, booleans, `null`) and rejects anything else,
 * while hosts can put any value into an activity. The node holds this projection; core keeps the host's activity
 * (`State.graphActivities`) and outputs that one.
 *
 * - `toJSON()` is called, as `JSON.stringify()` does: a `Date` becomes its ISO string.
 * - Other objects (class instances, `Map`, `Set`) become plain objects of their own enumerable properties.
 * - Functions, symbols and `undefined` are left out of objects and become `null` in arrays; non-finite numbers become
 *   `null`. Where `JSON.stringify()` throws, the value is left out as well: a `bigint`, and a reference to an ancestor
 *   (recursion).
 * - Frozen, so the store reuses the projection instead of copying it (`deepFreeze()` in the store).
 *
 * @returns `undefined` if the value has no JSON projection (e.g. a function).
 */
export default function toJSONValue(value: unknown): unknown {
  return toJSONValueWithAncestors(value, '', new Set());
}
