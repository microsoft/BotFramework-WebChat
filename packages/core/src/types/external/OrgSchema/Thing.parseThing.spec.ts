import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { thingSchema } from './Thing';

describe('Thing', () => {
  test('should parse', () => {
    expect(
      parse(thingSchema, {
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
      parse(thingSchema, {
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
      parse(thingSchema, {
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
      parse(thingSchema, {
        '@type': 'Thing',
        name: 1
      })
    ).toEqual({
      '@type': 'Thing',
      name: undefined
    });
  });
});
