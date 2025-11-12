import { is, pipe, startsWith, string, type GenericSchema, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD blank node identifier. Must be prefixed with `_:`.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node-identifier RDF 1.1 Concepts and Abstract Syntax: Blank node identifier}
 */
const BlankNodeIdentifierSchema = pipe(
  string('Blank node identifier must be a string'),
  startsWith('_:', 'Blank node identifier must starts with _:')
) as GenericSchema<`_:${string}`>;

type BlankNodeIdentifier = InferOutput<typeof BlankNodeIdentifierSchema>;

const isBlankNodeIdentifier = is.bind(BlankNodeIdentifierSchema);

export { BlankNodeIdentifierSchema, isBlankNodeIdentifier, type BlankNodeIdentifier };
