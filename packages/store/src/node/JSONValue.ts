import {
  array,
  boolean,
  lazy,
  null_,
  number,
  pipe,
  rawTransform,
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

const RECURSIVE: unique symbol = Symbol('recursive');

/**
 * Prepares the value for JSON serialization, following `JSON.stringify()`:
 *
 * - If the value has a `toJSON()` function, it is called with the key, and its returned value is used instead
 * - Objects and arrays are copied with their own enumerable properties only
 *
 * Other values are returned as-is to be validated by the schema.
 *
 * @returns The prepared value, or `RECURSIVE` if the value contains itself, directly or indirectly, after `toJSON()`.
 */
function prepareJSONValue(key: string, value: unknown, ancestors: Set<object>): unknown {
  const nextValue =
    value && typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function'
      ? value.toJSON(key)
      : value;

  if (!nextValue || typeof nextValue !== 'object') {
    return nextValue;
  } else if (ancestors.has(nextValue)) {
    return RECURSIVE;
  }

  ancestors.add(nextValue);

  try {
    if (Array.isArray(nextValue)) {
      const items: unknown[] = [];

      for (const [index, item] of nextValue.entries()) {
        const nextItem = prepareJSONValue(`${index}`, item, ancestors);

        if (nextItem === RECURSIVE) {
          return RECURSIVE;
        }

        items.push(nextItem);
      }

      return items;
    }

    const entries: [string, unknown][] = [];

    // Only own enumerable string keys, same as `JSON.stringify()`.
    for (const [key, property] of Object.entries(nextValue)) {
      const nextProperty = prepareJSONValue(key, property, ancestors);

      if (nextProperty === RECURSIVE) {
        return RECURSIVE;
      }

      entries.push([key, nextProperty]);
    }

    return Object.fromEntries(entries);
  } finally {
    ancestors.delete(nextValue);
  }
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
          // In object, remove property with value of undefined.
          // JSON.stringify({ one: 1, two: undefined, three: 3 }) === { one: 1, three: 3 }
          record(string(), union([nonRecursiveJSONValueSchema, undefined_()])),
          transform(value =>
            Object.fromEntries(Object.entries(value).filter(([_, value]) => typeof value !== 'undefined'))
          )
        )
      ],
      'Only boolean, null, number, string, array, and object is allowed for JSON value'
    )
  );

/**
 * Schema of JSON value, i.e. value which can be serialized by `JSON.stringify()`.
 *
 * Follows `JSON.stringify()`: `toJSON()` is honored and recursive values are rejected. They are handled once up front,
 * before parsing, as parsing recursive values would never end.
 */
const jsonValueSchema: GenericSchema<unknown, JSONValue> = pipe(
  unknown(),
  rawTransform(({ addIssue, dataset: { value }, NEVER }) => {
    // Root key is empty string, same as `JSON.stringify()`.
    const nextValue = prepareJSONValue('', value, new Set());

    if (nextValue === RECURSIVE) {
      addIssue({ message: 'JSON value must not be recursive' });

      return NEVER;
    }

    return nextValue;
  }),
  nonRecursiveJSONValueSchema
);

export { jsonValueSchema, type JSONValue };
