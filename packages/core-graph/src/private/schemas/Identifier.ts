import { is, pipe, string, union, url, type GenericSchema, type InferOutput } from 'valibot';

import { BlankNodeIdentifierSchema } from './BlankNodeIdentifier';

/**
 * Schema of JSON-LD identifier (`@id`). Must be either IRI or blank node identifier (prefixed with `_:`).
 *
 * @param message
 * @returns
 */
const IdentifierSchema = union(
  [
    BlankNodeIdentifierSchema,
    pipe(string('Identifier must be a string'), url('Identifier must be an IRI')) as GenericSchema<`https://${string}`>
  ],
  '@id is required and must be an IRI or blank node identifier'
);

type Identifier = InferOutput<typeof IdentifierSchema>;

const isIdentifier = is.bind(IdentifierSchema);

export { IdentifierSchema, isIdentifier, type Identifier };
