import { array, boolean, minLength, number, pipe, readonly, string, union, type InferOutput } from 'valibot';
import { jsonLiteralSchema } from './JSONLiteral.ts';
import { nodeReferenceSchema } from './NodeReference.ts';

const propertyValueSchema = pipe(
  array(
    union([
      nodeReferenceSchema,
      boolean('Property value must be boolean'),
      number('Property value must be number'),
      string('Property value must be string'),
      jsonLiteralSchema
    ]),
    'Property value must be boolean, number, string, node reference, or JSON literal'
  ),
  minLength(1, 'Property must have at least one value'),
  readonly()
);

type PropertyValue = InferOutput<typeof propertyValueSchema>;

export { propertyValueSchema, type PropertyValue };
