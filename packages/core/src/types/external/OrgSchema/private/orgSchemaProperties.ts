import {
  array,
  fallback,
  parse,
  pipe,
  transform,
  type BaseSchema,
  type Fallback,
  type GenericSchema,
  type InferInput,
  type InferOutput
} from 'valibot';

type SingularToArraySchema<T extends BaseSchema<unknown, unknown, any>> = GenericSchema<
  InferInput<T> | InferInput<T>[] | undefined,
  InferOutput<T>[] | undefined
>;

const singularToArray = <T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): GenericSchema<InferInput<T> | InferInput<T>[] | undefined, InferOutput<T>[] | undefined> =>
  fallback<SingularToArraySchema<T>, Fallback<SingularToArraySchema<T>>>(
    pipe(
      array(schema),
      transform(value => value.filter(value => typeof value !== 'undefined'))
    ),
    value => (value?.value ? [parse(schema, value?.value) as InferOutput<T>] : undefined)
  );

export default function orgSchemaProperties<T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): GenericSchema<InferInput<T> | readonly InferInput<T>[] | undefined, readonly InferOutput<T>[] | undefined> {
  return singularToArray(schema);
}
