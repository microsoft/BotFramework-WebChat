import { array, objectWithRest, optional, parse, pipe, readonly, string, union, type InferOutput } from 'valibot';

import type { FlatNodeObject } from './FlatNodeObject';
import identifier from './Identifier';
import { literal, type Literal } from './Literal';
import { nodeReference, type NodeReference } from './NodeReference';

const expandedFlatNodeObjectSchema = pipe(
  objectWithRest(
    {
      '@context': optional(string()),
      '@id': identifier(),
      '@type': optional(array(string()))
    },
    array(union([literal(), nodeReference()]))
  ),
  readonly()
);

type ExpandedFlatNodeObject = InferOutput<typeof expandedFlatNodeObjectSchema>;

/**
 * Expands `@type` and all property values of a flat node object into array.
 *
 * Notes:
 *
 * - `@context` and `@id` are not expanded, they will be kept as string.
 * - `@type` is expanded as array of string.
 *
 * @param node
 * @returns A node object with property values expanded.
 */
function expandArray(node: FlatNodeObject): ExpandedFlatNodeObject {
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
    expandedFlatNodeObjectSchema,
    Object.fromEntries([
      ...(context ? [['@context', context]] : []),
      ...(id ? [['@id', id]] : []),
      ...Array.from(propertyMap)
    ])
  );
}

export default expandArray;
export { expandedFlatNodeObjectSchema, type ExpandedFlatNodeObject };
