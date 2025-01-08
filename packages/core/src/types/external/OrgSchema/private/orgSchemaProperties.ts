import {
  array,
  fallback,
  parse,
  transform,
  type ArraySchema,
  type BaseSchema,
  type FallbackInfo,
  type Output,
  type UndefinedSchema
} from 'valibot';

import orgSchemaProperty from './orgSchemaProperty';

const singularToArray = <T extends BaseSchema>(schema: T): ArraySchema<T> | UndefinedSchema =>
  fallback<ArraySchema<T> | UndefinedSchema, (info?: FallbackInfo) => Output<T>>(
    transform(array(schema), value => value.filter(value => typeof value !== 'undefined')),
    value => (value?.input ? [parse(schema, value?.input)] : undefined)
  );

export default function orgSchemaProperties<T extends BaseSchema>(schema: T) {
  return singularToArray(orgSchemaProperty(schema));
}
