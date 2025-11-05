import { array, is, minLength, optional, pipe, strictObject, string, union, type InferOutput } from 'valibot';

import { IdentifierSchema } from './Identifier';
import freeze from './private/freeze';

/**
 * Schema of JSON-LD node reference. A node reference is an object with only `@id`, an optional `@type`, and nothing else.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#dfn-node-reference JSON-LD 1.1: Node reference}
 */
const NodeReferenceSchema = pipe(
  strictObject(
    {
      '@id': IdentifierSchema,
      '@type': optional(
        union(
          [string(), pipe(array(string()), minLength(1))],
          '@type must be string or array of string with at least 1 element'
        )
      )
    },
    'NodeReference must only have @id and optional @type'
  ),
  freeze()
);

type NodeReference = InferOutput<typeof NodeReferenceSchema>;

const isNodeReference = is.bind(undefined, NodeReferenceSchema);

export { isNodeReference, NodeReferenceSchema, type NodeReference };
