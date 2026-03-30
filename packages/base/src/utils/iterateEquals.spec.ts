import { beforeEach, describe, expect, test } from '@jest/globals';
import iterateEquals from './iterateEquals';

const iterateEqualsFlip: typeof iterateEquals = (x, y) => iterateEquals(y, x);

describe.each([['normal'], ['flip']])('with %s order', mode => {
  let fn: typeof iterateEqualsFlip;

  beforeEach(() => {
    fn = mode === 'normal' ? iterateEquals : iterateEqualsFlip;
  });

  test('should throw on same iterator instance', () => {
    const iterator = [1, 2, 3].values();

    expect(() => fn(iterator, iterator)).toThrow();
  });

  test('should return true on same iterable instance', () => {
    const iterator = [1, 2, 3];

    expect(fn(iterator, iterator)).toBe(true);
  });

  test('should return true on same value', () => {
    expect(fn([1, 2, 3].values(), [1, 2, 3].values())).toBe(true);
  });

  test('should return false on shorter start', () => {
    expect(fn([1, 2, 3].values(), [2, 3].values())).toBe(false);
  });

  test('should return false on shorter end', () => {
    expect(fn([1, 2, 3].values(), [1, 2].values())).toBe(false);
  });

  test('should return false against empty array', () => {
    expect(fn([1, 2, 3].values(), [].values())).toBe(false);
  });

  test('undefined should be treated as an element', () => {
    expect(fn([].values(), [undefined].values())).toBe(false);
  });

  test('null should be treated as an element', () => {
    expect(fn([].values(), [null].values())).toBe(false);
  });
});
