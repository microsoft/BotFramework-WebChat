import type { Entity } from './Entity';

// This is partial type of https://schema.org/Claim.
export type Claim = Entity & {
  '@context': 'https://schema.org/';
  '@id'?: string;
  '@type': 'Claim';
  type: 'https://schema.org/Claim';

  /* The textual content of this CreativeWork. */
  text?: string;

  /* URL of the item. */
  url?: string;
};

export function isClaim(entity: Entity): entity is Claim {
  return (
    entity.type === 'https://schema.org/Claim' ||
    (entity['@context'] === 'https://schema.org/' && entity['@type'] === 'Claim')
  );
}

export function hasText(claim: Claim): claim is Claim & { text: string } {
  return !!claim.text;
}
