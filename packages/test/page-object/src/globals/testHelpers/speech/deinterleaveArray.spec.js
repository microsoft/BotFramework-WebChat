import deinterleaveArray from './deinterleaveArray';

test('2 interleaves', () => {
  const actual = deinterleaveArray([1, 2, 3, 4, 5, 6], 2);

  expect(actual).toEqual([
    [1, 3, 5],
    [2, 4, 6]
  ]);
});

test('1 interleave', () => {
  const actual = deinterleaveArray([1, 2, 3], 1);

  expect(actual).toEqual([[1, 2, 3]]);
});

test('0 interleaves should throw', () => {
  expect(() => deinterleaveArray([], 0)).toThrow();
});

test('non-divisible interleaves should throw', () => {
  expect(() => deinterleaveArray([1, 2, 3], 2)).toThrow();
});
