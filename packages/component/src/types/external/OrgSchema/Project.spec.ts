import { isProject } from './Project';

test('should return true for Project', () =>
  expect(isProject({ '@context': 'https://schema.org', '@type': 'Project', type: 'https://schema.org/Project' })).toBe(
    true
  ));

test('should return false for Person', () =>
  expect(isProject({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Person' })).toBe(
    false
  ));
