import {
  array,
  optional,
  pipe,
  transform,
  union,
  type BaseSchema,
  type GenericSchema,
  type InferInput,
  type InferOutput
} from 'valibot';

const EMPTY_ARRAY = Object.freeze([]);

export default function orgSchemaProperties<T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): GenericSchema<InferInput<T> | readonly InferInput<T>[] | undefined, readonly InferOutput<T>[] | undefined> {
  return optional(
    union([
      // If it is an array.
      pipe(
        array(schema),
        transform(value => {
          // Filter out all `undefined` value.
          const result = value.filter(value => typeof value !== 'undefined');

          // If it is non-empty, return the frozen array, otherwise, return our empty flywheel.
          return result.length ? Object.freeze(result) : EMPTY_ARRAY;
        })
      ),
      pipe(
        // Otherwise, it must match the schema
        schema,
        // Put it in a frozen array tuple.
        transform(value => Object.freeze([value]))
      )
    ]),
    EMPTY_ARRAY
  );
}
