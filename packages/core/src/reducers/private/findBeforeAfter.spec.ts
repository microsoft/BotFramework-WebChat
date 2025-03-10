/* eslint no-magic-numbers: "off" */

import findBeforeAfter from './findBeforeAfter';

let before: number | string | undefined;
let after: number | string | undefined;
let index: number | undefined;
const getPosition = jest.fn<'after' | 'before' | 'unknown', [unknown]>().mockImplementation(() => {
  throw new Error('This function should not be called.');
});

describe('when passing an empty array', () => {
  beforeEach(() => ([before, after, index] = findBeforeAfter([] as (number | string)[], getPosition)));

  test('before should be undefined', () => expect(before).toBeUndefined());
  test('after should be undefined', () => expect(after).toBeUndefined());
  test('index should be undefined', () => expect(index).toBeUndefined());
});

describe('when passing a value of 2 to [a, 1, 3, b]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter(['a', 1, 3, 'b'], getPosition);
  });

  test('before should be 1', () => expect(before).toBe(1));
  test('after should be 3', () => expect(after).toBe(3));
  test('index should be 2', () => expect(index).toBe(2));
});

describe('when passing a value of 2 to [3, b]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter([3, 'b'], getPosition);
  });

  test('before should be undefined', () => expect(before).toBeUndefined());
  test('after should be 3', () => expect(after).toBe(3));
  test('index should be 0', () => expect(index).toBe(0));
});

describe('when passing a value of 2 to [a, 1]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter(['a', 1], getPosition);
  });

  test('before should be 1', () => expect(before).toBe(1));
  test('after should be undefined', () => expect(after).toBeUndefined());
  test('index should be 2', () => expect(index).toBe(2));
});

describe('when passing a value of 2 to [a, 1, b]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter(['a', 1, 'b'], getPosition);
  });

  test('before should be 1', () => expect(before).toBe(1));
  test('after should be "b"', () => expect(after).toBe('b'));
  test('index should be 2', () => expect(index).toBe(2));
});

describe('when passing a value of 2 to [a, 3, b]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter(['a', 3, 'b'], getPosition);
  });

  test('before should be "a"', () => expect(before).toBe('a'));
  test('after should be 3', () => expect(after).toBe(3));
  test('index should be 1', () => expect(index).toBe(1));
});

describe('when passing a value of 2 to [a, b]', () => {
  beforeEach(() => {
    getPosition.mockImplementation(value => (typeof value === 'number' ? (value < 2 ? 'before' : 'after') : 'unknown'));

    [before, after, index] = findBeforeAfter(['a', 'b'], getPosition);
  });

  test('before should be undefined', () => expect(before).toBeUndefined());
  test('after should be undefined', () => expect(after).toBeUndefined());
  test('index should be undefined', () => expect(index).toBeUndefined());
});
