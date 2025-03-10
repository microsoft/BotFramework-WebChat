/* eslint no-magic-numbers: "off" */

import findLastIndex from './findLastIndex';

describe('find last index', () => {
  test('of an existing element should return the index of last occurrence', () => {
    const actual = findLastIndex([1, 2, 3, 2, 1], value => value === 2);

    expect(actual).toBe(3);
  });

  test('of a non-existing element should return -1', () => {
    const actual = findLastIndex([1, 2, 3, 2, 1], value => value === 4);

    expect(actual).toBe(-1);
  });

  test('of an empty array should return -1', () => {
    const actual = findLastIndex([], value => value === 1);

    expect(actual).toBe(-1);
  });

  test('without a predicate should throw', () => {
    expect(() => findLastIndex([])).toThrowError('not a function');
  });

  test('without an array should throw', () => {
    expect(() => findLastIndex(undefined, value => value === 1)).toThrowError();
  });
});
