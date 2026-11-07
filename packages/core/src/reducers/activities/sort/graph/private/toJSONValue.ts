/**
 * The JSON projection of a value, as `JSON.parse(JSON.stringify(value))` would give, deeply frozen.
 *
 * The store only holds JSON (plain objects, arrays, strings, finite numbers, booleans, `null`) and rejects anything else,
 * while hosts can put any value into an activity. The node holds this projection; core keeps the host's activity
 * (`State.graphActivities`) and outputs that one.
 *
 * - `toJSON()` is called, as `JSON.stringify()` does: a `Date` becomes its ISO string.
 * - Other objects (class instances, `Map`, `Set`) become plain objects of their own enumerable properties.
 * - Frozen, so the store reuses the projection instead of copying it (`deepFreeze()` in the store).
 */
export default function toJSONValue(value: unknown, key: string = ''): unknown {
  const jsonValue =
    value && typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function'
      ? value.toJSON(key)
      : value;

  if (!jsonValue || typeof jsonValue !== 'object') {
    return jsonValue;
  }

  if (Array.isArray(jsonValue)) {
    return Object.freeze(jsonValue.map((item, index) => toJSONValue(item, `${index}`)));
  }

  return Object.freeze(
    Object.fromEntries(Object.entries(jsonValue).map(([name, item]) => [name, toJSONValue(item, name)]))
  );
}
