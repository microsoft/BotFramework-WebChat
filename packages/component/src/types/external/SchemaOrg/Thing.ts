/**
 * The most generic type of item.
 *
 * This is partial type of https://schema.org/Thing.
 */
export type Thing<T extends 'Thing' | string = string> = {
  '@context': 'https://schema.org';
  '@id'?: string;
  '@type': T;
  type: `https://schema.org/${T}`;

  /** An alias for the item. */
  alternateName?: string;

  /** The name of the item. */
  name?: string;
};

export function isThing(entity: { type: string }): entity is Thing<string> {
  return entity.type.startsWith('https://schema.org/');
}

export function isThingOf<T extends string>(thing: Thing, type: T): thing is Thing<T> {
  return (
    thing.type === `https://schema.org/${type}` ||
    (thing['@context'] === 'https://schema.org' && thing['@type'] === type)
  );
}
