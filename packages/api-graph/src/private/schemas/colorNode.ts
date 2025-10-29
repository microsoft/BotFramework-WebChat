import {
  array,
  null_,
  objectWithRest,
  optional,
  parse,
  pipe,
  string,
  union,
  type ErrorMessage,
  type InferOutput,
  type ObjectSchema,
  type ObjectWithRestIssue
} from 'valibot';

import type { FlatNodeObject } from './FlatNodeObject';
import identifier from './Identifier';
import { literal, type Literal } from './Literal';
import { nodeReference, type NodeReference } from './NodeReference';
import freeze from './private/freeze';

// Our opinions.
function slantNode<TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined = undefined>(
  message?: TMessage | undefined
) {
  return pipe(
    objectWithRest(
      {
        // We only support limited scope of the JSON-LD specification.
        '@context': optional(string('@context must be a string')),
        '@id': identifier('@id must be a string'),
        // "Multiple inheritance" is enabled by default.
        '@type': optional(
          pipe(array(string('element in @type must be a string'), '@type must be array of string'), freeze())
        ),
        // We follow Schema.org that "hasPart" denotes children.
        // This relationship is "membership" than "hierarchy".
        hasPart: optional(
          pipe(
            array(nodeReference('element in hasPart must be NodeReference'), 'hasPart must be array of NodeReference'),
            freeze()
          )
        ),
        // We follow Schema.org that "isPartOf" denotes parent, and multiple parent is possible.
        // This relationship is "membership" than "hierarchy".
        isPartOf: optional(
          pipe(
            array(
              nodeReference('element in isPartOf must be NodeReference'),
              'isPartOf must be array of NodeReference'
            ),
            freeze()
          )
        )
      },
      // The rest property values must be encapsulated in array, except when it's null.
      // Array of boolean, number, string, and node reference are accepted.
      union([array(literal()), array(nodeReference()), null_()]),
      message
    ),
    freeze()
  );
}

// Due to limitation on TypeScript, we cannot truthfully represent the typing.
type SlantNode = InferOutput<ObjectSchema<ReturnType<typeof slantNode>['entries'], undefined>> & {
  [key: string]: unknown;
};

/**
 * Put our opinions into the node object.
 *
 * @param node
 * @returns An opinionated node object which conforms to JSON-LD specification.
 */
function colorNode(node: FlatNodeObject): SlantNode {
  const propertyMap = new Map<string, readonly (Literal | NodeReference)[]>();
  let context: string | undefined;
  let id: string | undefined;

  for (const [key, value] of Object.entries(node)) {
    const parsedValue = parse(union([array(nodeReference()), array(literal()), nodeReference(), literal()]), value);

    switch (key) {
      case '@context':
        context = parse(string(), value);
        break;

      case '@id':
        id = parse(string(), value);
        break;

      default:
        // TODO: [P*] Test mixed array with literal and node reference.
        propertyMap.set(key, Array.isArray(parsedValue) ? parsedValue : Object.freeze([parsedValue]));
        break;
    }
  }

  return parse(
    slantNode(),
    Object.fromEntries([
      ...(context ? [['@context', context]] : []),
      ...(id ? [['@id', id]] : []),
      ...Array.from(propertyMap)
    ])
  );
}

export default colorNode;
export { slantNode, type SlantNode };
