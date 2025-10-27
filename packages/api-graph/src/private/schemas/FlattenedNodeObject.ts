import { array, objectWithRest, optional, pipe, string, union, type ErrorMessage, type InferOutput } from 'valibot';
import identifier from './Identifier';
import { literal } from './Literal';
import { nodeReference } from './NodeReference';
import freeze from './private/freeze';

// type FlattenedNodeObjectPropertyValue = Literal | NodeReference | readonly (Literal | NodeReference)[];

function flattenedNodeObjectPropertyValue<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return union(
    [pipe(array(union([literal(), nodeReference()])), freeze()), pipe(literal()), pipe(nodeReference())],
    message
  );
}

type FlattenedNodeObjectPropertyValue = InferOutput<ReturnType<typeof flattenedNodeObjectPropertyValue>>;

/**
 * Schema of JSON-LD node object.
 *
 * When parsed, all property value will be wrapped in an array.
 *
 * @param message
 * @returns
 */
function flattenedNodeObject<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return pipe(
    objectWithRest(
      {
        '@context': optional(string()),
        '@id': identifier(),
        '@type': optional(string())
      },
      flattenedNodeObjectPropertyValue(),
      message
    ),
    freeze()
  );
}

type FlattenedNodeObject = InferOutput<ReturnType<typeof flattenedNodeObject>>;

export default flattenedNodeObject;
export { flattenedNodeObjectPropertyValue, type FlattenedNodeObject, type FlattenedNodeObjectPropertyValue };
