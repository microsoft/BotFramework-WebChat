import { isClaim } from './Claim';

test('should return true for Claim', () =>
  expect(isClaim({ '@context': 'https://schema.org', '@type': 'Claim', type: 'https://schema.org/Claim' })).toBe(true));

test('should return false for Person', () =>
  expect(isClaim({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Person' })).toBe(
    false
  ));
