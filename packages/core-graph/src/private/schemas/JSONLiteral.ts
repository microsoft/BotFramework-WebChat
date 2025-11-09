import { is, literal, strictObject, unknown, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD literals.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#dfn-json-literal JSON-LD 1.1: JSON Literals}
 */
const JSONLiteralSchema = strictObject(
  {
    '@type': literal('@json'),

    // TODO: [P*] Some activities used in tests are not JSON-serializable.
    //       We are not using JSONValueSchema() until we fix those tests, such as "__tests__/hooks/useUserId.js".
    '@value': unknown()
  },
  'JSON literal must only have @type and @value'
);

type JSONLiteral = InferOutput<typeof JSONLiteralSchema>;

const isJSONLiteral = is.bind(JSONLiteralSchema);

export { isJSONLiteral, JSONLiteralSchema, type JSONLiteral };
