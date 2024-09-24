import { parse, string } from 'valibot';

import orgSchemaProperty from './orgSchemaProperty';

describe('orgSchemaProperty', () => {
  test('should keep valid type as-is', () => {
    expect(parse(orgSchemaProperty(string()), 'abc')).toBe('abc');
  });

  test('should keep undefined as-is', () => {
    expect(parse(orgSchemaProperty(string()), undefined)).toBeUndefined();
  });

  test('should convert invalid type to undefined', () => {
    expect(parse(orgSchemaProperty(string()), null)).toBeUndefined();
  });

  test('should take the first item from an array', () => {
    expect(parse(orgSchemaProperty(string()), ['abc', 'def', 'xyz'])).toBe('abc');
  });
});
