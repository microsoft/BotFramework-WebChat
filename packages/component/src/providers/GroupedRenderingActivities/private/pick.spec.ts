/// <reference types="jest" />

import pick from './pick';

test('when no item should return empty', () => {
  expect(pick([], [])).toEqual([[], []]);
});

test('when picking non-existing item should return empty', () => {
  expect(pick([], [1])).toEqual([[], []]);
});

test('when picking an item should remove item', () => {
  expect(pick([1], [1])).toEqual([[], [1]]);
});

test('when item do not exist should not remove item', () => {
  expect(pick([1], [2])).toEqual([[1], []]);
});

test('when item exist should remove item', () => {
  expect(pick([1, 2, 3], [2])).toEqual([[1, 3], [2]]);
});

test('when not picking anything should return all items', () => {
  expect(pick([1, 2, 3], [])).toEqual([[1, 2, 3], []]);
});

test('when picking two items should pick properly', () => {
  expect(pick([1, 2, 3], [2, 3])).toEqual([[1], [2, 3]]);
});

test('when picking undefined', () => {
  expect(pick([1], undefined)).toEqual([[1], []]);
});
