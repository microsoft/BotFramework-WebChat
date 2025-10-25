import { pipe, string, union, url, type ErrorMessage, type GenericSchema, type InferOutput } from 'valibot';

import blankNodeIdentifier from './BlankNodeIdentifier';

/**
 * Schema of JSON-LD identifier (`@id`). Must be either IRI or blank node identifier (prefixed with `_:`).
 *
 * @param message
 * @returns
 */
function identifier<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return union([blankNodeIdentifier(), pipe(string(), url()) as GenericSchema<`https://${string}`>], message);
}

type Identifier = InferOutput<ReturnType<typeof identifier>>;

export default identifier;
export { type Identifier };
