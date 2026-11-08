import { custom, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD identifier (`@id`). Must be either IRI or blank node identifier (prefixed with `_:`).
 *
 * - Blank node identifier must be prefixed with `_:`
 * - IRI must be a URL prefixed with `https://`
 *
 * A single `custom()` is used instead of `union()` and `pipe()` as identifiers are validated very frequently, it is
 * about 3x faster.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#node-identifiers JSON-LD 1.1: Node Identifiers}
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node-identifier RDF 1.1 Concepts and Abstract Syntax: Blank node identifier}
 */
const identifierSchema = custom<`_:${string}` | `https://${string}`>(
  value =>
    typeof value === 'string' && (value.startsWith('_:') || (value.startsWith('https://') && URL.canParse(value))),
  '@id is required and must be an IRI or blank node identifier'
);

type Identifier = InferOutput<typeof identifierSchema>;

export { identifierSchema, type Identifier };
