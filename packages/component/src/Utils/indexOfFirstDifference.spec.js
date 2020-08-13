import indexOfFirstDifference from './indexOfFirstDifference';

describe('Find index of first difference of', () => {
  test('"abc" and "abc"', () => {
    expect(indexOfFirstDifference('abc', 'abc')).toBe(-1);
  });

  test('"abc" and "xyz"', () => {
    expect(indexOfFirstDifference('abc', 'xyz')).toBe(0);
  });

  test('"abc" and "ace"', () => {
    expect(indexOfFirstDifference('abc', 'ace')).toBe(1);
  });

  test('"abc" and "abcde"', () => {
    expect(indexOfFirstDifference('abc', 'abcde')).toBe(3);
  });

  test('"abcde" and "abc"', () => {
    expect(indexOfFirstDifference('abcde', 'abc')).toBe(3);
  });

  test('"" and "abc"', () => {
    expect(indexOfFirstDifference('', 'abc')).toBe(0);
  });

  test('"abc" and ""', () => {
    expect(indexOfFirstDifference('abc', '')).toBe(0);
  });

  test('null and "abc"', () => {
    expect(() => indexOfFirstDifference(null, 'abc')).toThrow();
  });

  test('"abc" and undefined', () => {
    expect(() => indexOfFirstDifference('abc', undefined)).toThrow();
  });
});
