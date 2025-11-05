import { is, pipe, startsWith, string, type GenericSchema, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD blank node identifier. Must be prefixed with `_:`.
 */
const BlankNodeIdentifierSchema = pipe(
  string('Blank node identifier must be a string'),
  startsWith('_:', 'Blank node identifier must starts with _:')
) as GenericSchema<`_:${string}`>;

type BlankNodeIdentifier = InferOutput<typeof BlankNodeIdentifierSchema>;

const isBlankNodeIdentifier = is.bind(BlankNodeIdentifierSchema);

export { BlankNodeIdentifierSchema, isBlankNodeIdentifier, type BlankNodeIdentifier };
