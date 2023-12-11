/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
export type Thing<T extends string = string> = Readonly<{
  '@context'?: 'https://schema.org' | undefined;
  '@id'?: string | undefined;
  '@type': T;

  /** An alias for the item. */
  alternateName?: string | undefined;

  /** The name of the item. */
  name?: string | undefined;
}>;

/** Adds auxiliary types for Thing when it appears in Direct Line activity as a member of `entities` field. */
export type AsEntity<T extends Thing> = T &
  Readonly<{
    '@context': 'https://schema.org';
    type: `https://schema.org/${T['@type']}`;
  }>;

export function isThing(thing: unknown, currentContext?: string): thing is Thing<string> {
  if (typeof thing === 'object' && thing) {
    const context = thing['@context'] || currentContext;

    if (context) {
      return context === 'https://schema.org' && typeof thing['@type'] === 'string';
    }
  }

  return false;
}

export function isThingOf<T extends string>(thing: unknown, type: T, currentContext?: string): thing is Thing<T> {
  if (isThing(thing, currentContext)) {
    if ((thing['@context'] || currentContext) === 'https://schema.org' && thing['@type']) {
      return thing['@type'] === type;
    }
  }

  return false;
}

export function isThingAsEntity(thing: unknown, currentContext?: string): thing is AsEntity<Thing<string>> {
  // Needs bracket notation for TypeScript checking against `unknown`.
  // eslint-disable-next-line dot-notation
  if (typeof thing['type'] === 'string' && thing['type'].startsWith(`https://schema.org/`)) {
    return isThing(thing, currentContext);
  }

  return false;
}
