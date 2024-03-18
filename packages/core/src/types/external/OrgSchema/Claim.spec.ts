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
});
