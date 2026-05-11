import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { thingSchema } from './Thing';

const thingTemplate = parse(thingSchema, {});

describe('Thing', () => {
  test('should parse', () => {
    expect(
      parse(thingSchema, {
        '@type': 'Thing',
        name: 'John Doe'
      })
    ).toEqual({
      ...thingTemplate,
      '@type': ['Thing'],
      name: ['John Doe']
    });
  });

  test('should parse unknown @type', () => {
    expect(
      parse(thingSchema, {
        '@type': 'Unknown',
        name: 'John Doe'
      })
    ).toEqual({
      ...thingTemplate,
      '@type': ['Unknown'],
      name: ['John Doe']
    });
  });

  test('should remove unknown properties', () => {
    expect(
      parse(thingSchema, {
        '@type': 'Thing',
        something: 1
      })
    ).toEqual({
      ...thingTemplate,
      '@type': ['Thing']
    });
  });

  test('should set invalid properties to undefined', () => {
    expect(
      parse(thingSchema, {
        '@type': 'Thing',
        name: 1
      })
    ).toEqual({
      ...thingTemplate,
      '@type': ['Thing'],
      name: []
    });
  });

  test('should parse multiple types', () => {
    expect(
      parse(thingSchema, {
        '@type': ['Person', 'Thing'],
        name: 'John Doe'
      })
    ).toEqual({
      ...thingTemplate,
      '@type': ['Person', 'Thing'],
      name: ['John Doe']
    });
  });
});
