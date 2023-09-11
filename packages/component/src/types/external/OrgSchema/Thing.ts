import { type OrgSchemaThing } from 'botframework-webchat-core';

/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
export type Thing<T extends string = string> = OrgSchemaThing<T> & {
  '@id'?: string;

  /** An alias for the item. */
  alternateName?: string;

  /** The name of the item. */
  name?: string;
};

export function isThing(thing: { '@context'?: string; '@type'?: string; type?: string }): thing is Thing<string> {
  if (typeof thing === 'object' && thing) {
    return (
      '@context' in thing &&
      '@type' in thing &&
      'type' in thing &&
      thing['@context'] === 'https://schema.org' &&
      typeof thing['@type'] === 'string' &&
      thing.type === `https://schema.org/${thing['@type']}`
    );
  }

  return false;
}

export function isThingOf<T extends string>(
  thing: { '@context'?: string; '@type'?: string; type?: string },
  type: T
): thing is Thing<T> {
  if (typeof thing === 'object' && thing) {
    return (
      '@context' in thing &&
      '@type' in thing &&
      'type' in thing &&
      thing['@context'] === 'https://schema.org' &&
      thing['@type'] === type &&
      thing.type === `https://schema.org/${type}`
    );
  }

  return false;
}
