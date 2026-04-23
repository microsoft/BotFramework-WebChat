import {
  array,
  fallback,
  optional,
  pipe,
  transform,
  union,
  type BaseSchema,
  type Fallback,
  type GenericSchema,
  type InferOutput
} from 'valibot';

type ArrayToSingularSchema<T extends BaseSchema<unknown, unknown, any>> = GenericSchema<
  InferOutput<T> | InferOutput<T>[] | undefined,
  InferOutput<T> | undefined
>;

const orgSchemaProperty = <T extends BaseSchema<unknown, unknown, any>>(schema: T): ArrayToSingularSchema<T> =>
  fallback<ArrayToSingularSchema<T>, Fallback<ArrayToSingularSchema<T>>>(
    optional(
      union([
        pipe(
          array(schema),
          transform(array => array[0])
        ),
        schema
      ])
    ),
    undefined
  );

export default orgSchemaProperty;
