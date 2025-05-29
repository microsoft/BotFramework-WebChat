/// <reference types="jest" />

import { number, object } from 'valibot';
import validateProps from './validateProps';

beforeEach(() =>
  jest.spyOn(console, 'error').mockImplementation(() => {
    // Intentionally left blank.
  })
);

afterEach(() => jest.restoreAllMocks());

test('when isolation is not specified then success should return as-is', () => {
  const props = { one: 1, two: 2 };
  const result = validateProps(object({ one: number() }), props);

  expect(result).toBe(props);
});

test('when no isolation then success should return as-is', () => {
  const props = { one: 1, two: 2 };
  const result = validateProps(object({ one: number() }), props, 'no isolation');

  expect(result).toBe(props);
});

test('when in strict isolation then success should return isolated result', () => {
  const props = { one: 1, two: 2 };
  const result = validateProps(object({ one: number() }), props, 'strict');

  expect(result).not.toBe(props);
  expect(result).toEqual({ one: 1 });
});

test('when isolation is not specified then failure should throw', () => {
  const props = { two: 2 };

  expect(() => validateProps(object({ one: number() }), props)).toThrow();
});

test('when no isolation then failure should throw', () => {
  const props = { two: 2 };

  expect(() => validateProps(object({ one: number() }), props, 'no isolation')).toThrow();
});

test('when in strict isolation then failure should throw', () => {
  const props = { two: 2 };

  expect(() => validateProps(object({ one: number() }), props, 'strict')).toThrow();
});

test('when under production mode and isolation is not specified then failure should warn', () => {
  // @ts-expect-error Accessing process without @types/node.
  process.env.NODE_ENV = 'production';

  const props = { two: 2 };

  expect(validateProps(object({ one: number() }), props, 'strict')).toBe(props);
});

test('when under production mode and no isolation then failure should warn', () => {
  // @ts-expect-error Accessing process without @types/node.
  process.env.NODE_ENV = 'production';

  const props = { two: 2 };

  expect(validateProps(object({ one: number() }), props, 'strict')).toBe(props);
});

test('when under production mode and in strict isolation then failure should warn', () => {
  // @ts-expect-error Accessing process without @types/node.
  process.env.NODE_ENV = 'production';

  const props = { two: 2 };

  expect(validateProps(object({ one: number() }), props, 'strict')).toBe(props);
});
