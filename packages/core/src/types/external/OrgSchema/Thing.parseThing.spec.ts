import { parseThing } from './Thing';

describe('Thing', () => {
  test('should parse', () => {
    expect(
      parseThing({
        '@type': 'Thing',
        name: 'John Doe'
      })
    ).toEqual({
      '@type': 'Thing',
      name: 'John Doe'
    });
  });

  test('should parse unknown @type', () => {
    expect(
      parseThing({
        '@type': 'Unknown',
        name: 'John Doe'
      })
    ).toEqual({
      '@type': 'Unknown',
      name: 'John Doe'
    });
  });

  // This is an intentional drift from JSON-LD.
  // Assuming expecting an object of Thing while the actual is CreativeWork.
  // If unknown properties are removed, we will remove properties that are solely for CreativeWork.
  test('should not remove unknown properties', () => {
    expect(
      parseThing({
        '@type': 'Thing',
        something: 1
      })
    ).toEqual({
      '@type': 'Thing',
      something: 1
    });
  });

  test('should set invalid properties to undefined', () => {
    expect(
      parseThing({
        '@type': 'Thing',
        name: 1
      })
    ).toEqual({
      '@type': 'Thing',
      name: undefined
    });
  });
});
