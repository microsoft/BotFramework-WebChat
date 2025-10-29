import {
  array,
  minLength,
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
      // The rest property values must be encapsulated in array.
      // Array of boolean, number, string, and node reference are accepted.
      pipe(array(union([literal(), nodeReference()])), minLength(1)),
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
 * Put our opinions into the node.
 *
 * The opinions are targeted around a few principles:
 *
 * - Simplifying downstream logics
 *    - Must have `@id`: every node in the graph must be identifiable
 *    - Uniform getter/setter: every property value is an array, except `@context` and `@id`
 *    - Uniform typing: node reference must be `{ "@id": string }` to reduce confusion with a plain string
 *    - Support multiple types: every `@type` must be an array of string
 *    - Reduce confusion: empty array and `null` is removed
 *       - `[]` and `null` are same as if the property is removed
 *    - Flattened: property values must be non-null literals or node reference, no nested objects
 *       - `null` will be converted to [] and eventually the property will be removed
 *       - Any array containing `null` is not supported and will throw, as it is likely a bug in code
 *    - Do not handle full JSON-LD spec: `@context` is an opaque string and the schema is not honored
 * - Auto-linking for Schema.org: `hasPart` and `isPartOf` are auto-inversed
 * - Keep its root: every node is compliant to JSON-LD, understood by standard parsers
 *
 * @param node
 * @returns An opinionated node object which conforms to JSON-LD specification.
 */
function colorNode(node: FlatNodeObject): SlantNode {
  const propertyMap = new Map<string, readonly (Literal | NodeReference)[]>();
  let context: string | undefined;
  let id: string | undefined;

  for (const [key, value] of Object.entries(node)) {
    const parsedValue = parse(
      union([array(union([literal(), nodeReference()])), nodeReference(), literal(), null_()]),
      value
    );

    switch (key) {
      case '@context':
        context = parse(string(), value);
        break;

      case '@id':
        id = parse(string(), value);
        break;

      default: {
        // TODO: [P*] Test mixed array with literal and node reference.
        const slantValue = Array.isArray(parsedValue)
          ? parsedValue
          : Object.freeze(parsedValue === null ? [] : [parsedValue]);

        slantValue.length && propertyMap.set(key, slantValue);

        break;
      }
    }
  }

  return parse(
    slantNode(),
    Object.fromEntries([...(context ? [['@context', context]] : []), ['@id', id], ...Array.from(propertyMap)])
  );
}

export default colorNode;
export { slantNode, type SlantNode };
