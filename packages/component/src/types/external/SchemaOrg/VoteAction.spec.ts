import { isVoteAction } from './VoteAction';

test('should return true for VoteAction', () =>
  expect(
    isVoteAction({ '@context': 'https://schema.org', '@type': 'VoteAction', type: 'https://schema.org/VoteAction' })
  ).toBe(true));

test('should return false for Person', () =>
  expect(isVoteAction({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Person' })).toBe(
    false
  ));
