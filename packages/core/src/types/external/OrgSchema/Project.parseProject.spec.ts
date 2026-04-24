import { describe, expect, test } from '@jest/globals';
import { parseProject, projectSchema } from './Project';
import { parse } from 'valibot';

const projectTemplate = parse(projectSchema, {});

describe('Project', () => {
  test('should parse', () => {
    expect(
      parseProject({
        '@type': 'Project',
        name: 'Microsoft',
        slogan: 'Empower every person and every organization on the planet to achieve more.'
      })
    ).toEqual({
      ...projectTemplate,
      '@type': 'Project',
      name: ['Microsoft'],
      slogan: ['Empower every person and every organization on the planet to achieve more.']
    });
  });
});
