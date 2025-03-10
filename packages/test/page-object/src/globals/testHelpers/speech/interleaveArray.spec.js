import interleaveArray from './interleaveArray';

test('zero array', () => {
  expect(interleaveArray()).toEqual([]);
});

test('one array', () => {
  const array1 = [1, 3, 5];

  const result = interleaveArray(array1);

  expect(result).not.toBe(array1);
  expect(result).toEqual(array1);
});

test('two arrays', () => {
  const array1 = [1, 3, 5];
  const array2 = [2, 4, 6];

  const result = interleaveArray(array1, array2);

  expect(result).toEqual([1, 2, 3, 4, 5, 6]);
});

test('two arrays of different length', () => {
  expect(() => {
    interleaveArray([1, 3, 5], [2]);
  }).toThrow();
});
