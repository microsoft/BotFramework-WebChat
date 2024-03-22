import { parseProject } from './Project';

describe('Project', () => {
  test('should parse', () => {
    expect(
      parseProject({
        '@type': 'Project',
        name: 'Microsoft',
        slogan: 'Empower every person and every organization on the planet to achieve more.'
      })
    ).toEqual({
      '@type': 'Project',
      name: 'Microsoft',
      slogan: 'Empower every person and every organization on the planet to achieve more.'
    });
  });
});
