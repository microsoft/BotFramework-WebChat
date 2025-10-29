import { pipe, safeParse, strictObject, type ErrorMessage, type InferOutput } from 'valibot';

import identifier from './Identifier';
import freeze from './private/freeze';

/**
 * Schema of JSON-LD node reference. A node reference is an object with only `@id` and nothing else.
 *
 * @param message
 * @returns
 */
function nodeReference<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return pipe(strictObject({ '@id': identifier() }, message), freeze());
}

type NodeReference = InferOutput<ReturnType<typeof nodeReference>>;

function isNodeReference(nodeObject: NodeReference): nodeObject is NodeReference {
  return safeParse(nodeReference(), nodeObject).success;
}

export { isNodeReference, nodeReference, type NodeReference };
