import { parseCreativeWork } from './CreativeWork';

describe('CreativeWork', () => {
  test('should parse properties from Thing', () =>
    expect(
      parseCreativeWork({
        '@type': 'CreativeWork',
        name: 'Business @ the Speed of Thought'
      })
    ).toEqual({
      '@type': 'CreativeWork',
      name: 'Business @ the Speed of Thought'
    }));

  test('should parse thing of Book type', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought'
      })
    ).toEqual({
      '@type': 'Book',
      name: 'Business @ the Speed of Thought'
    }));

  test('should parse citation (singular)', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought',
        citation: { '@type': 'Book', name: 'The Road Ahead' }
      })
    ).toEqual({
      '@type': 'Book',
      name: 'Business @ the Speed of Thought',
      citation: [{ '@type': 'Book', name: 'The Road Ahead' }]
    }));

  test('should parse citation (plural)', () =>
    expect(
      parseCreativeWork({
        '@type': 'Book',
        name: 'Business @ the Speed of Thought',
        citation: [{ '@type': 'Book', name: 'The Road Ahead' }]
      })
    ).toEqual({
      '@type': 'Book',
      name: 'Business @ the Speed of Thought',
      citation: [{ '@type': 'Book', name: 'The Road Ahead' }]
    }));
});
