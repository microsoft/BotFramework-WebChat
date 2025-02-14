import {
  array,
  fallback,
  parse,
  pipe,
  transform,
  type ArraySchema,
  type BaseSchema,
  type UndefinedSchema
} from 'valibot';

import orgSchemaProperty from './orgSchemaProperty';

const singularToArray = <T extends BaseSchema<unknown, unknown, any>>(
  schema: T
): ArraySchema<T, any> | UndefinedSchema<any> =>
  fallback(
    pipe(
      array(schema),
      transform(value => value.filter(value => typeof value !== 'undefined'))
    ),
    value => (value?.value ? [parse(schema, value?.value)] : undefined)
  );

export default function orgSchemaProperties<T extends BaseSchema<unknown, unknown, any>>(schema: T) {
  return singularToArray(orgSchemaProperty(schema));
}
