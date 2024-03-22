import { parseClaim } from './Claim';

describe('Claim', () => {
  test('should parse appearance', () =>
    expect(
      parseClaim({
        '@type': 'Claim',
        appearance: {
          '@type': 'Book',
          name: 'Business @ the Speed of Thought'
        }
      })
    ).toEqual({
      '@type': 'Claim',
      appearance: {
        '@type': 'Book',
        name: 'Business @ the Speed of Thought'
      }
    }));

  test('should parse claimInterpreter', () =>
    expect(
      parseClaim({
        '@type': 'Claim',
        claimInterpreter: {
          '@type': 'Project',
          slogan: 'Empower every person and every organization on the planet to achieve more.'
        }
      })
    ).toEqual({
      '@type': 'Claim',
      claimInterpreter: {
        '@type': 'Project',
        slogan: 'Empower every person and every organization on the planet to achieve more.'
      }
    }));

  describe('should parse position', () => {
    test('as a number', () =>
      expect(parseClaim({ '@type': 'Claim', position: 1 })).toEqual({ '@type': 'Claim', position: 1 }));

    test('as a string', () =>
      expect(parseClaim({ '@type': 'Claim', position: 'First' })).toEqual({ '@type': 'Claim', position: 'First' }));
  });
});
