/* eslint-disable @typescript-eslint/no-empty-function */
import isPromiseLike from './isPromiseLike';

test('Promise.withResolvers() should return true', () =>
  expect(isPromiseLike(Promise.withResolvers().promise)).toBe(true));

test('new Promise() should return true', () => expect(isPromiseLike(new Promise(() => {}))).toBe(true));

test('Promise-like should return true', () => expect(isPromiseLike({ then: () => {} })).toBe(true));

test('Boolean should return false', () => expect(isPromiseLike(true)).toBe(false));

test('Number should return false', () => expect(isPromiseLike(0)).toBe(false));

test('Object should return false', () => expect(isPromiseLike({ then: 0 })).toBe(false));
