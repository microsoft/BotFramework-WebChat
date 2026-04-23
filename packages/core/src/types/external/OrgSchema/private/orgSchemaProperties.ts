import {
  array,
  fallback,
  optional,
  parse,
  pipe,
  readonly,
  transform,
  type BaseSchema,
  type Fallback,
  type GenericSchema,
  type InferInput,
  type InferOutput
} from 'valibot';

type SingularToArraySchema<T extends BaseSchema<unknown, unknown, any>> = GenericSchema<
  InferInput<T> | readonly InferInput<T>[] | undefined,
  readonly InferOutput<T>[] | undefined
>;

const EMPTY_ARRAY = Object.freeze([]);

const singularToArray = <T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): GenericSchema<InferInput<T> | readonly InferInput<T>[] | undefined, readonly InferOutput<T>[] | undefined> =>
  optional(
    fallback<SingularToArraySchema<T>, Fallback<SingularToArraySchema<T>>>(
      pipe(
        // If it is an array.
        array(schema),
        // Filter out all `undefined` value.
        transform(value => Object.freeze(value.filter(value => typeof value !== 'undefined'))),
        // If it is empty, return our empty flywheel.
        transform(value => (value.length ? value : EMPTY_ARRAY)),
        readonly()
      ),
      value => (value?.value ? Object.freeze([parse(schema, value?.value) as InferOutput<T>]) : EMPTY_ARRAY)
    ),
    EMPTY_ARRAY
  );

export default function orgSchemaProperties<T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): GenericSchema<InferInput<T> | readonly InferInput<T>[] | undefined, readonly InferOutput<T>[] | undefined> {
  return singularToArray(schema);
}
