import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { claimSchema } from './Claim';
import { creativeWorkSchema } from './CreativeWork';
import { projectSchema } from './Project';

const claimTemplate = parse(claimSchema, {});
const creativeWorkTemplate = parse(creativeWorkSchema, {});
const projectTemplate = parse(projectSchema, {});

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
      ...claimTemplate,
      '@type': 'Claim',
      appearance: [
        {
          ...creativeWorkTemplate,
          '@type': 'Book',
          name: ['Business @ the Speed of Thought']
        }
      ]
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
      ...claimTemplate,
      '@type': 'Claim',
      claimInterpreter: [
        {
          ...projectTemplate,
          '@type': 'Project',
          slogan: ['Empower every person and every organization on the planet to achieve more.']
        }
      ]
    }));

  describe('should parse position', () => {
    test('as a number', () =>
      expect(
        parse(claimSchema, {
          '@type': 'Claim',
          position: 1
        })
      ).toEqual({
        ...claimTemplate,
        '@type': 'Claim',
        position: [1]
      }));

    test('as a string', () =>
      expect(
        parse(claimSchema, {
          '@type': 'Claim',
          position: 'First'
        })
      ).toEqual({
        ...claimTemplate,
        '@type': 'Claim',
        position: ['First']
      }));
  });
});
