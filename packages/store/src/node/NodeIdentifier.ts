import { union, type InferOutput } from 'valibot';
import { blankNodeIdentifierSchema } from './BlankNodeIdentifier.ts';
import { iriSchema } from './IRI.ts';

/**
 * Schema of JSON-LD identifier (`@id`). Must be either IRI or blank node identifier (prefixed with `_:`).
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#node-identifiers JSON-LD 1.1: Node Identifiers}
 */
const identifierSchema = union(
  [blankNodeIdentifierSchema, iriSchema],
  '@id is required and must be an IRI or blank node identifier'
);

type Identifier = InferOutput<typeof identifierSchema>;

export { identifierSchema, type Identifier };
