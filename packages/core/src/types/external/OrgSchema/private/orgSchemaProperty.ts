import { array, fallback, optional, pipe, transform, union, type BaseSchema } from 'valibot';

const orgSchemaProperty = <T extends BaseSchema<unknown, unknown, any>>(schema: T) =>
  fallback(
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
