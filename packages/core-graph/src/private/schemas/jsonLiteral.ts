import { literal, object, safeParse, type ErrorMessage, type InferOutput } from 'valibot';
import jsonValueSchema from './jsonValueSchema';

/**
 * Schema of JSON-LD literals.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#dfn-json-literal JSON-LD 1.1: JSON Literal}
 * @param message
 * @returns
 */
function jsonLiteral<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  // TODO: [P*] Null should not be literal because it could become null[].
  return object(
    {
      '@type': literal('@json'),
      '@value': jsonValueSchema
    },
    message
  );
}

type JSONLiteral = InferOutput<ReturnType<typeof jsonLiteral>>;

function isJSONLiteral(value: unknown): value is JSONLiteral {
  return safeParse(jsonLiteral(), value).success;
}

export { isJSONLiteral, jsonLiteral, type JSONLiteral };
