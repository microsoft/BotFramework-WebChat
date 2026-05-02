import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { claimSchema } from './Claim.js';
import { creativeWorkSchema, parseCreativeWork } from './CreativeWork.js';

const claimTemplate = parse(claimSchema, {});
const creativeWorkTemplate = parse(creativeWorkSchema, {});

describe('CreativeWork', () => {
  test('should parse properties from Thing', () =>
    expect(
      parseCreativeWork({
        '@type': 'CreativeWork',
        name: 'Business @ the Speed of Thought'
      })
    ).toEqual({
      ...creativeWorkTemplate,
      '@type': 'CreativeWork',
      name: ['Business @ the Speed of Thought']
    }));

  test('should parse thing of Book type', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought'
      })
    ).toEqual({
      ...creativeWorkTemplate,
      '@type': 'Book',
      name: ['Business @ the Speed of Thought']
    }));

  test('should parse citation (singular)', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought',
        citation: { '@type': 'Book', name: 'The Road Ahead' }
      })
    ).toEqual({
      ...creativeWorkTemplate,
      '@type': 'Book',
      name: ['Business @ the Speed of Thought'],
      citation: [
        {
          ...claimTemplate,
          '@type': 'Book',
          name: ['The Road Ahead']
        }
      ]
    }));

  test('should parse citation (plural)', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought',
        citation: [{ '@type': 'Book', name: 'The Road Ahead' }]
      })
    ).toEqual({
      ...creativeWorkTemplate,
      '@type': 'Book',
      name: ['Business @ the Speed of Thought'],
      citation: [
        {
          ...claimTemplate,
          '@type': 'Book',
          name: ['The Road Ahead']
        }
      ]
    }));
});
