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

export function isThing(thing: any, currentContext?: string): thing is Thing<string> {
  if (typeof thing === 'object' && thing) {
    const context = thing['@context'] || currentContext;

    if (context) {
      return context === 'https://schema.org' && typeof thing['@type'] === 'string';
    }

    return typeof thing.type === 'string' && thing.type.startsWith(`https://schema.org/`);
  }

  return false;
}

export function isThingOf<T extends string>(thing: any, type: T, currentContext?: string): thing is Thing<T> {
  if (isThing(thing, currentContext)) {
    if ((thing['@context'] || currentContext) === 'https://schema.org' && thing['@type']) {
      return thing['@type'] === type;
    }

    return thing.type === `https://schema.org/${type}`;
  }

  return false;
}
