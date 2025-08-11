/// <reference types="jest" />

import group from './group';

test('when nothing is passed should return empty array', () => {
  expect(
    group([], () => {
      throw new Error('Should not call');
    })
  ).toEqual([]);
});

test('when a single item is passed should return it as grouped', () => {
  expect(group([1], () => [1])).toEqual([[1]]);
});

test('when two separate items is passed should return it ungrouped', () => {
  expect(group([1, 2], jest.fn().mockReturnValueOnce([1]).mockReturnValueOnce([2]))).toEqual([[1], [2]]);
});

test('with 3 items in 2 groups should return it grouped properly', () => {
  expect(group([1, 2, 3], jest.fn().mockReturnValueOnce([1, 3]).mockReturnValueOnce([2]))).toEqual([[1, 3], [2]]);
});

test('when return items not in the array should be ignored', () => {
  expect(group([1, 2], jest.fn().mockReturnValueOnce([1, 3]).mockReturnValueOnce([2]))).toEqual([[1], [2]]);
});

test('when grouping with undefined', () => {
  expect(group([1, 2], () => undefined)).toEqual([[1], [2]]);
});
