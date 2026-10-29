import { literal, strictObject, type InferOutput } from 'valibot';
import { jsonValueSchema } from './JSONValue.ts';

/**
 * Schema of JSON-LD literals.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#dfn-json-literal JSON-LD 1.1: JSON Literals}
 */
const jsonLiteralSchema = strictObject(
  {
    '@type': literal('@json', 'JSON literal must have @type of "@json"'),
    '@value': jsonValueSchema
  },
  'JSON literal must have @type and @value only'
);

type JSONLiteral = InferOutput<typeof jsonLiteralSchema>;

export { jsonLiteralSchema, type JSONLiteral };
