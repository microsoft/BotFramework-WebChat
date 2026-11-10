import { check, pipe, string, url, type GenericSchema, type InferOutput } from 'valibot';

/**
 * Our favor of IRI.
 *
 * @see {@link https://www.rfc-editor.org/info/rfc3987/ RFC 3987: Internationalized Resource Identifiers (IRIs)}
 */
const iriSchema = pipe(
  string('IRI must be a string'),
  url('IRI must be an IRI'),
  check(value => value.startsWith('https://') || value.startsWith('urn:'), 'IRI must starts with https:// or urn:')
) as GenericSchema<`${'https://' | 'urn:'}${string}`>;

type IRI = InferOutput<typeof iriSchema>;

export { iriSchema, type IRI };
