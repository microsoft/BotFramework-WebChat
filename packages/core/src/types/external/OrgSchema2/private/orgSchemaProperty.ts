import { fallback, optional, type BaseSchema } from 'valibot';

const orgSchemaProperty = <T extends BaseSchema>(schema: T) => fallback(optional(schema), undefined);

export default orgSchemaProperty;
