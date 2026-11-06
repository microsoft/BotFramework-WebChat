import {
  array,
  boolean,
  check,
  custom,
  lazy,
  null_,
  number,
  pipe,
  record,
  string,
  transform,
  undefined_,
  union,
  unknown,
  type GenericSchema
} from 'valibot';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { readonly [key: string]: JSONValue }
  | readonly JSONValue[];

/**
 * Checks if the value is a plain object, i.e. created by `{}` or `Object.create(null)`.
 *
 * Class instances (e.g. `Date`, `Map`, `URL`) are not plain objects and are not JSON values.
 */
function isPlainObject(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Checks if the value is recursive, i.e. an array or plain object containing itself, directly or indirectly.
 *
 * Recursive values cannot be serialized by `JSON.stringify()`. The same object appearing more than once without
 * containing itself (e.g. `{ one: shared, two: shared }`) is not recursive.
 */
function isRecursive(value: unknown, ancestors: Set<object> = new Set()): boolean {
  // Other objects are not JSON values and will be rejected by the schema.
  if (!value || typeof value !== 'object' || (!Array.isArray(value) && !isPlainObject(value))) {
    return false;
  } else if (ancestors.has(value)) {
    return true;
  }

  ancestors.add(value);

  const recursive = Object.values(value).some(value => isRecursive(value, ancestors));

  ancestors.delete(value);

  return recursive;
}

const nonRecursiveJSONValueSchema: GenericSchema<JSONValue> =
  // Lazy because self-referencing.
  lazy(() =>
    union(
      [
        boolean(),
        null_(),
        number(),
        string(),
        array(
          union([
            nonRecursiveJSONValueSchema,
            // In array, transform undefined into null.
            // JSON.stringify([1, undefined, 3]) === [1, null, 3]
            pipe(
              undefined_(),
              transform(() => null)
            )
          ])
        ),
        pipe(
          // Only plain objects, class instances such as `Date` and `Map` are not allowed.
          // Must be checked before `record()`, which copies the object into a plain object.
          custom<{ readonly [key: string]: JSONValue }>(isPlainObject, 'Only plain object is allowed for JSON value'),
          // In object, remove property with value of undefined.
          // JSON.stringify({ one: 1, two: undefined, three: 3 }) === { one: 1, three: 3 }
          record(string(), union([nonRecursiveJSONValueSchema, undefined_()])),
          transform(value =>
            Object.fromEntries(Object.entries(value).filter(([_, value]) => typeof value !== 'undefined'))
          )
        )
      ],
      'Only boolean, null, number, string, array, and plain object is allowed for JSON value'
    )
  );

/**
 * Schema of JSON value: boolean, null, number, string, array, and plain object.
 *
 * - Recursive values are not allowed, they are checked once up front, as parsing them would never end
 * - Class instances (e.g. `Date`, `Map`) are not allowed, `toJSON()` is not called
 * - Property with value of `undefined` is removed, `undefined` in array is transformed into `null`
 */
const jsonValueSchema: GenericSchema<unknown, JSONValue> = pipe(
  unknown(),
  check(value => !isRecursive(value), 'JSON value must not be recursive'),
  nonRecursiveJSONValueSchema
);

export { jsonValueSchema, type JSONValue };
