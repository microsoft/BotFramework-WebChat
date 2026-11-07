import { pipe, rawTransform, unknown, type GenericSchema } from 'valibot';
import { isDangerousKey } from '../private/deepFreeze.ts';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { readonly [key: string]: JSONValue }
  | readonly JSONValue[];

/** Returned by `toJSONValue()` when `JSON.stringify()` would skip the value, i.e. `undefined`, function, and symbol. */
const OMITTED: unique symbol = Symbol('omitted');

/** Thrown when `JSON.stringify()` would throw. */
class JSONValueError extends TypeError {}

/**
 * Unwraps boxed primitives, e.g. `new Number(1)`, as `JSON.stringify()` does.
 *
 * @see {@link https://tc39.es/ecma262/#sec-serializejsonproperty ECMAScript: SerializeJSONProperty}
 */
function unbox(value: object): unknown {
  return value instanceof Number
    ? Number(value)
    : value instanceof String
      ? String(value)
      : value instanceof Boolean || value instanceof BigInt
        ? value.valueOf()
        : value;
}

/**
 * Calls `toJSON()` if any, then unwraps boxed primitives, as `JSON.stringify()` does.
 */
function preprocess(key: string, value: unknown): unknown {
  if ((value && typeof value === 'object') || typeof value === 'bigint') {
    const { toJSON } = value as { readonly toJSON?: unknown };

    typeof toJSON === 'function' && (value = toJSON.call(value, key));
  }

  return value && typeof value === 'object' ? unbox(value) : value;
}

function toJSONArray(value: readonly unknown[], ancestors: object[]): JSONValue[] {
  const array: JSONValue[] = [];

  for (let index = 0; index < value.length; index++) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const item = toJSONValue(`${index}`, value[+index], ancestors);

    array.push(item === OMITTED ? null : item);
  }

  return array;
}

function toJSONObject(value: object, ancestors: object[]): Record<string, JSONValue> {
  const object: Record<string, JSONValue> = {};

  for (const key of Object.keys(value)) {
    if (!isDangerousKey(key)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const item = toJSONValue(key, Reflect.get(value, key), ancestors);

      // Dangerous keys are skipped, bracket assignment on plain object will not set prototype.
      // eslint-disable-next-line security/detect-object-injection
      item === OMITTED || (object[key] = item);
    }
  }

  return object;
}

/**
 * Converts the value into what `JSON.parse(JSON.stringify(value))` would return, in a single pass.
 *
 * Follows the `SerializeJSONProperty` algorithm, then `JSON.parse()`:
 *
 * - `toJSON()` is called with the key, e.g. `Date` becomes an ISO string
 * - Boxed primitives (e.g. `new Number(1)`) are unwrapped
 * - `NaN`, `Infinity`, and `-Infinity` become `null`, `-0` becomes `0`
 * - `undefined`, functions, and symbols are omitted: removed from object, or become `null` in array (including hole)
 * - Other objects (e.g. class instances, `Map`, `Set`, objects without prototype) become plain objects of their own
 *   enumerable string-keyed properties, getters are called once
 * - Arrays become plain arrays of their `length`, extra properties are dropped
 * - Throws on recursion and `BigInt`, as `JSON.stringify()` does
 *
 * The only difference: dangerous keys (e.g. `__proto__`, see `isDangerousKey()`) are removed and their getters are not
 * called, while `JSON.parse()` would create them as own properties.
 *
 * @param key Key of the value in its parent, passed to `toJSON()`, `''` for the root.
 * @param ancestors Arrays and objects being converted, to detect recursion.
 */
function toJSONValue(key: string, originalValue: unknown, ancestors: object[]): JSONValue | typeof OMITTED {
  const value = preprocess(key, originalValue);

  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    // `-0 + 0` is `0`.
    return Number.isFinite(value) ? value + 0 : null;
  } else if (typeof value === 'bigint') {
    throw new JSONValueError('JSON value must not contain BigInt');
  } else if (!value || typeof value !== 'object') {
    // `undefined`, function, and symbol.
    return OMITTED;
  } else if (ancestors.includes(value)) {
    throw new JSONValueError('JSON value must not be recursive');
  }

  ancestors.push(value);

  const result = Array.isArray(value) ? toJSONArray(value, ancestors) : toJSONObject(value, ancestors);

  ancestors.pop();

  return result;
}

/**
 * Schema of JSON value, the output is exactly the same as `JSON.parse(JSON.stringify(value))`, except dangerous keys are
 * removed, see `toJSONValue()`.
 *
 * Fails when `JSON.parse(JSON.stringify(value))` would throw: recursion, `BigInt`, and when the value itself is omitted
 * (`undefined`, function, or symbol), which `JSON.stringify()` returns `undefined`.
 *
 * Arrays and objects are always copied in a single pass, `toJSON()` and getters are called once, as `JSON.stringify()`
 * does.
 */
const jsonValueSchema: GenericSchema<unknown, JSONValue> = pipe(
  unknown(),
  rawTransform(({ addIssue, dataset: { value }, NEVER }) => {
    try {
      const result = toJSONValue('', value, []);

      if (result !== OMITTED) {
        return result;
      }

      addIssue({ message: 'JSON value must not be undefined, function, or symbol' });
    } catch (error) {
      if (!(error instanceof JSONValueError)) {
        throw error;
      }

      addIssue({ message: error.message });
    }

    return NEVER;
  })
);

export { jsonValueSchema, type JSONValue };
