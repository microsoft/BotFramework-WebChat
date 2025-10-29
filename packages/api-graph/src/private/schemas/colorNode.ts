import {
  array,
  looseObject,
  minLength,
  null_,
  objectWithRest,
  optional,
  parse,
  pipe,
  string,
  transform,
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
        // We treat @context as opaque string than a schema.
        '@context': optional(string('@context must be an IRI')),
        '@id': identifier('@id is required and must be an IRI or blank node identifier'),
        // Multi-membership is enabled by default.
        '@type': pipe(
          array(string('element in @type must be a string'), '@type must be array of string'),
          freeze(),
          minLength(1, '@type must have at least one element')
        ),
        // We follow Schema.org that "hasPart" denotes children.
        // This relationship is "membership" than "hierarchy".
        hasPart: optional(
          pipe(
            array(nodeReference('element in hasPart must be NodeReference'), 'hasPart must be array of NodeReference'),
            freeze(),
            minLength(1, 'hasPart, if present, must have at least one element')
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
            freeze(),
            minLength(1, 'isPartOf, if present, must have at least one element')
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

function slantNodeWithFix() {
  return pipe(
    looseObject({}),
    transform(node => {
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
            const slantedValue = Array.isArray(parsedValue)
              ? parsedValue
              : Object.freeze(parsedValue === null ? [] : [parsedValue]);

            slantedValue.length && propertyMap.set(key, slantedValue);

            break;
          }
        }
      }

      return parse(
        slantNode(),
        Object.fromEntries([...(context ? [['@context', context]] : []), ['@id', id], ...Array.from(propertyMap)])
      );
    })
  );
}

/**
 * Put our opinions into the node.
 *
 * The opinions are targeted around a few principles:
 *
 * - Simplifying downstream logics
 *    - Must have `@id`: every node in the graph must be identifiable
 *    - Uniform getter/setter: every property value is an array, except `@context` and `@id`
 *    - Uniform typing: node reference must be `{ "@id": string }` to reduce confusion with plain string
 *    - Support multiple types: every `@type` must be an array of string
 *    - Reduce confusion: empty array and `null` is removed
 *       - `[]` and `null` are same as if the property is removed
 *    - Flattened: property values must be non-null literals or node reference, no nested objects
 *       - Any array containing `null` is not supported and will throw, as it is likely a bug in code
 *    - Do not handle full JSON-LD spec: `@context` is an opaque string and its schema is not honored
 * - Auto-linking for Schema.org: `hasPart` and `isPartOf` are auto-inversed
 * - Keep its root: every node is compliant to JSON-LD, understood by standard parsers
 * - Debuggability: must have at least one `@type`
 *
 * @param node
 * @returns An opinionated node object which conforms to JSON-LD specification.
 */
function colorNode(node: FlatNodeObject | SlantNode): SlantNode {
  return parse(slantNodeWithFix(), node);
}

export default colorNode;
export { slantNode, slantNodeWithFix, type SlantNode };
