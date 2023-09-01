export type Entity = {
  '@context': 'https://schema.org/';
  '@type': string;
  type: `https://schema.org/${string}`;

  /** An alias for the item. */
  alternateName?: string;

  /** The name of the item. */
  name?: string;
};

export function isEntity(entity: { type: string }): entity is Entity {
  return entity.type.startsWith('https://schema.org/');
}
