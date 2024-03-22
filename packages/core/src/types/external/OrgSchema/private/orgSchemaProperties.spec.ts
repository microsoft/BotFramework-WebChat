import { parse, string } from 'valibot';

import orgSchemaProperties from './orgSchemaProperties';

describe('orgSchemaProperties', () => {
  describe('singular', () => {
    test('should transform into plural', () => {
      expect(parse(orgSchemaProperties(string()), 'abc')).toEqual(['abc']);
    });

    test('should turn item of invalid type into undefined', () => {
      expect(parse(orgSchemaProperties(string()), 0)).toBeUndefined();
    });

    test('should turn null into undefined', () => {
      expect(parse(orgSchemaProperties(string()), null)).toBeUndefined();
    });

    test('should keep undefined as-is', () => {
      expect(parse(orgSchemaProperties(string()), undefined)).toBeUndefined();
    });
  });

  describe('plural', () => {
    test('should keep as-is', () => {
      expect(parse(orgSchemaProperties(string()), ['abc', 'xyz'])).toEqual(['abc', 'xyz']);
    });

    test('should keep empty array as-is', () => {
      expect(parse(orgSchemaProperties(string()), [])).toEqual([]);
    });

    test('should remove items with invalid type (all)', () => {
      expect(parse(orgSchemaProperties(string()), [0])).toEqual([]);
    });

    test('should remove items with invalid type (some)', () => {
      expect(parse(orgSchemaProperties(string()), ['abc', 0, 'xyz'])).toEqual(['abc', 'xyz']);
    });
  });
});
