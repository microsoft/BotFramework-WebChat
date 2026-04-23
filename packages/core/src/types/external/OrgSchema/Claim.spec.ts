import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { claimSchema } from './Claim';

describe('Claim', () => {
  test('should parse appearance', () =>
    expect(
      parse(claimSchema, {
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
      parse(claimSchema, {
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
      expect(parse(claimSchema, { '@type': 'Claim', position: 1 })).toEqual({ '@type': 'Claim', position: 1 }));

    test('as a string', () =>
      expect(parse(claimSchema, { '@type': 'Claim', position: 'First' })).toEqual({
        '@type': 'Claim',
        position: 'First'
      }));
  });
});
