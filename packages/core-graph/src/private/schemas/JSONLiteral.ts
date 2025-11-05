import { is, literal, strictObject, type InferOutput } from 'valibot';
import { JSONValueSchema } from './JSONValue';

/**
 * Schema of JSON-LD literals.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#dfn-json-literal JSON-LD 1.1: JSON Literal}
 */
const JSONLiteralSchema = strictObject(
  {
    '@type': literal('@json'),
    '@value': JSONValueSchema
  },
  'JSON literal must only have @type and @value'
);

type JSONLiteral = InferOutput<typeof JSONLiteralSchema>;

const isJSONLiteral = is.bind(JSONLiteralSchema);

export { isJSONLiteral, JSONLiteralSchema, type JSONLiteral };
