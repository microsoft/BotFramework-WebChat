import type { Entity } from './Entity';

// This is partial type of https://schema.org/Person.
export type Person = Entity & {
  '@context': 'https://schema.org/';
  '@id'?: string;
  '@type': 'Person';
  type: 'https://schema.org/Person';

  description?: string;
  text?: string;

  /* URL of the item. */
  url?: string;
};

export function isPerson(entity: Entity): entity is Person {
  return (
    entity.type === 'https://schema.org/Person' ||
    (entity['@context'] === 'https://schema.org/' && entity['@type'] === 'Person')
  );
}
