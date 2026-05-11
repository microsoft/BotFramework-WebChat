import { expect, test } from '@jest/globals';
import deepFreeze from './deepFreeze';

test('should freeze object', () => {
  const input = { abc: 123 };

  expect(Object.isFrozen(deepFreeze(input))).toBe(true);
});

test('should freeze array', () => {
  const input = [123];

  expect(Object.isFrozen(deepFreeze(input))).toBe(true);
});

test('should freeze nested object', () => {
  const input = { abc: { value: 123 } };
  const output = deepFreeze(input);

  expect(Object.isFrozen(output)).toBe(true);
  expect(Object.isFrozen(output.abc)).toBe(true);
});

test('should freeze nested array', () => {
  const input = [{ value: 123 }];
  const output = deepFreeze(input);

  expect(Object.isFrozen(output)).toBe(true);
  expect(Object.isFrozen(output[0])).toBe(true);
});

test('should freeze sparse array', () => {
  const input = [];

  input[100] = 789;

  Object.defineProperty(input, 0, {
    get() {
      // Sparse array, should skip iterating sparse slots.
      throw new Error('Should not iterate every item in the sparse array');
    }
  });

  const output = deepFreeze(input);

  expect(Object.isFrozen(output)).toBe(true);
  expect(output[100]).toBe(789);
});

test('should throw away invalid index', () => {
  const input = [];

  input[-1] = 123;

  const output = deepFreeze(input);

  expect(Object.isFrozen(output)).toBe(true);
  expect(output[-1]).toBeUndefined();
});

test('should handle reserved keywords without prototype pollution', () => {
  const input = { ['__proto__']: { polluted: true }, prototype: undefined };
  const output = deepFreeze(input);

  expect(Object.isFrozen(output)).toBe(true);
  expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
  expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
});

test('should handle primitive values', () => {
  expect(deepFreeze('abc')).toBe('abc');
  expect(deepFreeze(1)).toBe(1);
  expect(deepFreeze(true)).toBe(true);
});
