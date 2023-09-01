import type { Entity } from './Entity';

// This is partial type of https://schema.org/VoteAction.
export type VoteAction = Entity & {
  '@context': 'https://schema.org/';
  '@id'?: string;
  '@type': 'VoteAction';
  type: 'https://schema.org/VoteAction';

  actionOption?: string;
};

export function isVoteAction(entity: Entity): entity is VoteAction {
  return (
    entity.type === 'https://schema.org/VoteAction' ||
    (entity['@context'] === 'https://schema.org/' && entity['@type'] === 'VoteAction')
  );
}
