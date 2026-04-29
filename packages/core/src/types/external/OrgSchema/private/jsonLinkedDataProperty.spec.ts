import { describe, expect, test } from '@jest/globals';
import { parse, string } from 'valibot';

import jsonLinkedDataProperty from './jsonLinkedDataProperty';

describe('jsonLinkedDataProperty', () => {
  describe('singular', () => {
    test('should transform into plural', () => {
      expect(parse(jsonLinkedDataProperty(string()), 'abc')).toEqual(['abc']);
    });

    test('should turn item of invalid type into undefined', () => {
      expect(parse(jsonLinkedDataProperty(string()), 0)).toEqual([]);
    });

    test('should turn null into undefined', () => {
      expect(parse(jsonLinkedDataProperty(string()), null)).toEqual([]);
    });

    test('should keep undefined as-is', () => {
      expect(parse(jsonLinkedDataProperty(string()), undefined)).toEqual([]);
    });
  });

  describe('plural', () => {
    test('should keep as-is', () => {
      expect(parse(jsonLinkedDataProperty(string()), ['abc', 'xyz'])).toEqual(['abc', 'xyz']);
    });

    test('should keep empty array as-is', () => {
      expect(parse(jsonLinkedDataProperty(string()), [])).toEqual([]);
    });

    test('should remove items with invalid type (all)', () => {
      expect(parse(jsonLinkedDataProperty(string()), [0])).toEqual([]);
    });

    test('should remove items with invalid type (some)', () => {
      expect(parse(jsonLinkedDataProperty(string()), ['abc', 0, 'xyz'])).toEqual(['abc', 'xyz']);
    });
  });
});
