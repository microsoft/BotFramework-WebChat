import { array, objectWithRest, optional, pipe, string, union, type ErrorMessage, type InferOutput } from 'valibot';
import identifier from './Identifier';
import { literal } from './Literal';
import { nodeReference } from './NodeReference';
import freeze from './private/freeze';

function flatNodeObjectPropertyValue<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return union(
    [pipe(array(union([literal(), nodeReference()])), freeze()), pipe(literal()), pipe(nodeReference())],
    message
  );
}

type FlatNodeObjectPropertyValue = InferOutput<ReturnType<typeof flatNodeObjectPropertyValue>>;

/**
 * Schema of JSON-LD node object.
 *
 * When parsed, all property value will be wrapped in an array.
 *
 * @param message
 * @returns
 */
function flatNodeObject<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return pipe(
    objectWithRest(
      {
        '@context': optional(string('Complex @context is not supported in our implementation')),
        '@id': identifier(),
        '@type': optional(union([array(string()), string()]))
      },
      flatNodeObjectPropertyValue(),
      message
    ),
    freeze()
  );
}

type FlatNodeObject = InferOutput<ReturnType<typeof flatNodeObject>>;

export default flatNodeObject;
export { flatNodeObjectPropertyValue, type FlatNodeObject, type FlatNodeObjectPropertyValue };
