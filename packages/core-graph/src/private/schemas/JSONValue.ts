import {
  array,
  boolean,
  lazy,
  null_,
  number,
  pipe,
  record,
  string,
  transform,
  undefined_,
  union,
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

const JSONValueSchema: GenericSchema<JSONValue> = lazy(() =>
  union(
    [
      boolean(),
      null_(),
      number(),
      string(),
      array(
        union([
          JSONValueSchema,
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
        record(string(), union([JSONValueSchema, undefined_()])),
        transform(value =>
          Object.fromEntries(Object.entries(value).filter(([_, value]) => typeof value !== 'undefined'))
        )
      )
    ],
    'Only boolean, null, number, string, array, and object is allowed for JSON value'
  )
);

export { JSONValueSchema, type JSONValue };
