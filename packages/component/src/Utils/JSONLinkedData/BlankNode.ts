/**
 * A blank node identifier is a string starting with `"_:"`
 *
 * @see https://json-ld.github.io/json-ld.org/spec/latest/json-ld/#dfn-blank-node-identifiers
 */
export type BlankNodeIdentifier = `_:${string}`;

/**
 * A blank node is a node with `@id` starting with `"_:"`
 *
 * @see https://json-ld.github.io/json-ld.org/spec/latest/json-ld/#dfn-blank-nodes
 */
export type BlankNode = { '@id': BlankNodeIdentifier };
