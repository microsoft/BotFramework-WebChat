import { array, fallback, optional, transform, union, type BaseSchema } from 'valibot';

const orgSchemaProperty = <T extends BaseSchema>(schema: T) =>
  fallback(optional(union([transform(array(schema), array => array[0]), schema])), undefined);

export default orgSchemaProperty;
