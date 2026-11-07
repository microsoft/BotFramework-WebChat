import { check, pipe, transform, unknown, type GenericSchema } from 'valibot';
import { isDangerousKey } from '../private/deepFreeze.ts';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { readonly [key: string]: JSONValue }
  | readonly JSONValue[];

const NOT_JSON_VALUE_MESSAGE = 'Only boolean, null, number, string, array, and plain object is allowed for JSON value';
const RECURSIVE_MESSAGE = 'JSON value must not be recursive';

/**
 * Checks if the value is a plain object, i.e. created by `{}` or `Object.create(null)`.
 *
 * Class instances (e.g. `Date`, `Map`, `URL`) are not plain objects and are not JSON values.
 */
function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Recursively checks if the value is JSON-compatible in a single pass, returns the error message, or `undefined` if valid.
 *
 * @param ancestors Arrays and objects being checked, to detect recursion. The same object appearing more than once
 *        without containing itself (e.g. `{ one: shared, two: shared }`) is not recursive.
 */
function getJSONValueError(value: unknown, ancestors: object[]): string | undefined {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return undefined;
  } else if (typeof value === 'number') {
    // `JSON.stringify()` turns `NaN` and `Infinity` into `null`.
    return Number.isFinite(value) ? undefined : NOT_JSON_VALUE_MESSAGE;
  } else if (!value || typeof value !== 'object' || (!Array.isArray(value) && !isPlainObject(value))) {
    return NOT_JSON_VALUE_MESSAGE;
  } else if (ancestors.includes(value)) {
    return RECURSIVE_MESSAGE;
  }

  ancestors.push(value);

  let error: string | undefined;

  if (Array.isArray(value)) {
    for (let index = 0; !error && index < value.length; index++) {
      const item: unknown = value[+index];

      // `undefined` in array (including hole) is allowed, it will be transformed into `null`.
      error = typeof item === 'undefined' ? undefined : getJSONValueError(item, ancestors);
    }
  } else {
    for (const key of Object.keys(value)) {
      const item: unknown = Reflect.get(value, key);

      // Property with value of `undefined` is allowed, it will be removed. Dangerous keys are removed regardless.
      error = typeof item === 'undefined' || isDangerousKey(key) ? undefined : getJSONValueError(item, ancestors);

      if (error) {
        break;
      }
    }
  }

  ancestors.pop();

  return error;
}

/**
 * Normalizes a JSON-compatible value as `JSON.stringify()` does, unchanged arrays and objects are returned as-is.
 *
 * - Property with value of `undefined` is removed, `{ one: 1, two: undefined }` becomes `{ one: 1 }`
 * - `undefined` in array (including hole) becomes `null`, `[1, undefined]` becomes `[1, null]`
 * - Dangerous keys (e.g. `__proto__`) are removed, see `isDangerousKey()`
 *
 * The value must be checked by `getJSONValueError()` first, i.e. no recursion.
 */
function normalizeJSONValue(value: unknown): JSONValue {
  if (!value || typeof value !== 'object') {
    return value as JSONValue;
  } else if (Array.isArray(value)) {
    let nextValue: JSONValue[] | undefined;

    for (let index = 0; index < value.length; index++) {
      const item: unknown = value[+index];
      const nextItem = typeof item === 'undefined' ? null : normalizeJSONValue(item);

      // Copy on first change, also copy when there is a hole.
      if (!nextValue && (nextItem !== item || !(index in value))) {
        nextValue = value.slice(0, index);
      }

      nextValue?.push(nextItem);
    }

    return nextValue ?? (value satisfies unknown[] as JSONValue[]);
  }

  let nextValue: Record<string, JSONValue> | undefined;
  const keys = Object.keys(value);

  for (const [index, key] of keys.entries()) {
    const item: unknown = Reflect.get(value, key);
    const removed = typeof item === 'undefined' || isDangerousKey(key);
    const nextItem = removed ? undefined : normalizeJSONValue(item);

    // Copy on first change.
    if (!nextValue && (removed || nextItem !== item)) {
      nextValue = Object.fromEntries(keys.slice(0, index).map(key => [key, Reflect.get(value, key)]));
    }

    // `Object.fromEntries()` and bracket assignment on plain object never set prototype as dangerous keys are removed.
    // eslint-disable-next-line security/detect-object-injection
    nextValue && !removed && (nextValue[key] = nextItem);
  }

  return nextValue ?? (value as { readonly [key: string]: JSONValue });
}

/**
 * Schema of JSON value: boolean, null, number, string, array, and plain object.
 *
 * Checked recursively in a single pass by a custom `check()`, then normalized as `JSON.stringify()` does.
 *
 * - Recursive values are not allowed
 * - Class instances (e.g. `Date`, `Map`) and functions are not allowed, `toJSON()` is not called
 * - `NaN` and `Infinity` are not allowed
 * - Property with value of `undefined` is removed, `undefined` in array is transformed into `null`
 * - Unchanged arrays and objects are returned as-is without copying
 */
const jsonValueSchema: GenericSchema<unknown, JSONValue> = pipe(
  unknown(),
  check(
    value => !getJSONValueError(value, []),
    ({ input }) => getJSONValueError(input, []) ?? NOT_JSON_VALUE_MESSAGE
  ),
  transform(normalizeJSONValue)
);

export { jsonValueSchema, type JSONValue };
