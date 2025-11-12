import { freeze } from '@msinternal/botframework-webchat-base/valibot';
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
  type InferOutput,
  type ObjectSchema
} from 'valibot';

import type { FlatNodeObject } from './FlatNodeObject';
import { IdentifierSchema } from './Identifier';
import { JSONLiteralSchema, type JSONLiteral } from './JSONLiteral';
import { LiteralSchema, type Literal } from './Literal';
import { NodeReferenceSchema, type NodeReference } from './NodeReference';

// Our opinions.
const SlantNodeSchema = pipe(
  objectWithRest(
    {
      // We treat @context as opaque string than a schema.
      '@context': optional(string('@context must be an IRI')),
      '@id': IdentifierSchema,
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
          array(NodeReferenceSchema, 'hasPart must be array of NodeReference'),
          freeze(),
          minLength(1, 'hasPart, if present, must have at least one element')
        )
      ),
      // We follow Schema.org that "isPartOf" denotes parent, and multiple parent is possible.
      // This relationship is "membership" than "hierarchy".
      isPartOf: optional(
        pipe(
          array(NodeReferenceSchema, 'isPartOf must be array of NodeReference'),
          freeze(),
          minLength(1, 'isPartOf, if present, must have at least one element')
        )
      )
    },
    // The rest property values must be encapsulated in array.
    // Array of boolean, number, string, JSON literal, and node reference are accepted.
    pipe(
      array(
        union(
          [JSONLiteralSchema, LiteralSchema, NodeReferenceSchema],
          'Properties of slant node must be array of JSON literal, literal or node reference'
        )
      ),
      minLength(1, 'Properties of slant node must be an array with at least 1 element')
    )
  ),
  freeze()
);

// Due to limitation on TypeScript, we cannot truthfully represent the typing.
type SlantNode = InferOutput<ObjectSchema<(typeof SlantNodeSchema)['entries'], undefined>> & {
  [key: string]: unknown;
};

const SlantNodeWithFixSchema = pipe(
  looseObject({}),
  transform(node => {
    const propertyMap = new Map<string, readonly (JSONLiteral | Literal | NodeReference)[]>();
    let context: string | undefined;
    let id: string | undefined;

    for (const [key, value] of Object.entries(node)) {
      const parsedValue = parse(
        union(
          [
            array(union([JSONLiteralSchema, LiteralSchema, NodeReferenceSchema])),
            JSONLiteralSchema,
            LiteralSchema,
            NodeReferenceSchema,
            null_()
          ],
          'Only JSON literal, literal, node reference or null can be parsed into slant node'
        ),
        value
      );

      switch (key) {
        case '@context':
          context = parse(string('@context must be an IRI'), value);
          break;

        case '@id':
          id = parse(IdentifierSchema, value);
          break;

        default: {
          const slantedValue = Object.freeze(
            Array.isArray(parsedValue)
              ? parsedValue.slice(0)
              : parsedValue === null || typeof parsedValue === 'undefined'
                ? []
                : [parsedValue]
          );

          slantedValue.length && propertyMap.set(key, slantedValue);

          break;
        }
      }
    }

    return parse(
      SlantNodeSchema,
      Object.fromEntries([...(context ? [['@context', context]] : []), ['@id', id], ...Array.from(propertyMap)])
    );
  })
);

/**
 * Put our opinions into the node.
 *
 * The opinions are targeted around a few principles:
 *
 * - Simplifying downstream logics
 *    - Must have `@id`: every node in the graph must be identifiable
 *    - Uniform getter/setter: every property value is an array, except `@context` and `@id`
 *    - Unique typing: node reference must be `{ "@id": string }` to reduce confusion with plain string
 *    - Support multiple types: every `@type` must be an array of string
 *    - Reduce confusion: property value with empty array and `null` is removed
 *       - `[]` and `null` are same as if the property is removed
 *    - Flattened: property values must be non-null literals, node reference, or JSON literals
 *       - Any array containing `null` is not supported and will throw unless it is JSON literal, as it is likely a bug in code
 *    - JSON literals will have boxing kept: `{ '@type': '@json', '@value': JSONValue }`
 *       - `@value` could be null, if unwrapped, will be confusing as we removed nulls
 *    - Do not handle full JSON-LD spec: `@context` is an opaque string and its schema is not honored
 *    - Node reference only has `@id` and it should not contain `@type`
 *    - Reduce confusion: node reference must not appear at the root of the flattened graph, they are semantically empty
 * - Auto-linking for Schema.org: `hasPart` and `isPartOf` are auto-inversed
 * - Keep its root: every node is compliant to JSON-LD, understood by standard parsers
 * - Debuggability: must have at least one `@type`
 *
 * @param node
 * @returns An opinionated node object which conforms to JSON-LD specification.
 */
function colorNode(node: FlatNodeObject | SlantNode): SlantNode {
  return parse(SlantNodeWithFixSchema, node);
}

export default colorNode;
export { SlantNodeSchema, SlantNodeWithFixSchema, type SlantNode };
