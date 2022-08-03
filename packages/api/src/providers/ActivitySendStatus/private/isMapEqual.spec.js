/* eslint-env jest */

import isMapEqual from './isMapEqual';

test('should return false if number of keys are different', () => {
  const x = new Map(Object.entries({ one: 1, two: 2 }));
  const y = new Map(Object.entries({ three: 3 }));

  expect(isMapEqual(x, y)).toBe(false);
});

test('should return false if one of the value is different', () => {
  const x = new Map(Object.entries({ one: 1, two: 2 }));
  const y = new Map(Object.entries({ one: 10, two: 2 }));

  expect(isMapEqual(x, y)).toBe(false);
});

test('should return false if one of the value is not reference equals', () => {
  const one = Symbol();
  const two = Symbol();

  const x = new Map(Object.entries({ one, two }));
  const y = new Map(Object.entries({ one, two: Symbol }));

  expect(isMapEqual(x, y)).toBe(false);
});

test('should return true if both maps has same set of keys and values', () => {
  const one = Symbol();
  const two = Symbol();

  const x = new Map(Object.entries({ one, two }));
  const y = new Map(Object.entries({ one, two }));

  expect(isMapEqual(x, y)).toBe(true);
});

test('should return true if both maps has same set of keys and values even different order of keys', () => {
  const one = Symbol();
  const two = Symbol();

  const x = new Map([
    ['one', one],
    ['two', two]
  ]);
  const y = new Map([
    ['two', two],
    ['one', one]
  ]);

  expect(isMapEqual(x, y)).toBe(true);
  expect(Array.from(x.keys())).not.toEqual(Array.from(y.keys()));
});

test('should return true if both maps are empty', () => {
  const x = new Map();
  const y = new Map();

  expect(isMapEqual(x, y)).toBe(true);
});

test('should return false if the first map is falsy and the second is empty', () => {
  const x = undefined;
  const y = new Map();

  expect(isMapEqual(x, y)).toBe(false);
});

test('should return false if the first map is empty and the second is falsy', () => {
  const x = new Map();
  const y = undefined;

  expect(isMapEqual(x, y)).toBe(false);
});

test('should return false if one of key is number and another key is string', () => {
  const x = new Map([[1, 'one']]);
  const y = new Map([['1', 'one']]);

  expect(isMapEqual(x, y)).toBe(false);
});
