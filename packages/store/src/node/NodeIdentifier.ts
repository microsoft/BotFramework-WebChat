import { custom, type InferOutput } from 'valibot';
import type { BlankNodeIdentifier } from './BlankNodeIdentifier.ts';

/**
 * Parses the URL, returns `undefined` if it is invalid.
 *
 * Uses `URL.parse()` if available, otherwise falls back to `new URL()`. On invalid input, `new URL()` throws, which is
 * ~50x slower than `URL.parse()` returning `null`.
 */
function parseURL(value: string): URL | undefined {
  if (typeof URL.parse === 'function') {
    return URL.parse(value) ?? undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

/** Checks if the URL is valid, uses `URL.canParse()` if available, otherwise falls back to `parseURL()`. */
function canParseURL(value: string): boolean {
  return typeof URL.canParse === 'function' ? URL.canParse(value) : !!parseURL(value);
}

/**
 * Schema of JSON-LD identifier (`@id`). Must be either IRI or blank node identifier (prefixed with `_:`).
 *
 * IRI must starts with `https://` or `urn:` (with path).
 *
 * For performance, it is a single `custom()` instead of `union()`, which build issues for every failed option.
 *
 * @see {@link https://www.w3.org/TR/json-ld11/#node-identifiers JSON-LD 1.1: Node Identifiers}
 */
const identifierSchema = custom<BlankNodeIdentifier | `https://${string}` | `urn:${string}`>(
  value =>
    typeof value === 'string' &&
    (value.startsWith('_:') ||
      (value.startsWith('https://') && canParseURL(value)) ||
      (value.startsWith('urn:') && !!parseURL(value)?.pathname)),
  '@id is required and must be an IRI or blank node identifier'
);

type NodeIdentifier = InferOutput<typeof identifierSchema>;

export { identifierSchema, type NodeIdentifier };
