import {
  any,
  array,
  fallback,
  optional,
  pipe,
  safeParse,
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
    fallback(
      union([
        // If it is an array.
        pipe(
          array(any()),
          transform(value => {
            // Filter out all `undefined` and invalid values.
            const result = value.reduce((output, value) => {
              if (typeof value !== 'undefined') {
                const result = safeParse(schema, value);

                result.success && output.push(result.output);
              }

              return output;
            }, []);

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
      () => EMPTY_ARRAY
    ),
    EMPTY_ARRAY
  );
}
