import intersectionOf from './intersectionOf';

test('intersection of [1, 2, 3] and [3, 4, 5] should return [3]', () => {
  const actual = intersectionOf([1, 2, 3], [3, 4, 5]);

  expect(actual).toEqual([3]);
});

test('intersection of [1, 2, 3], [3, 4, 5], [1, 3, 5] should return [3]', () => {
  const actual = intersectionOf([1, 2, 3], [3, 4, 5], [1, 3, 5]);

  expect(actual).toEqual([3]);
});

test('intersection of [1, 3, 5] and [2, 4, 6] should return []', () => {
  const actual = intersectionOf([1, 3, 5], [2, 4, 6]);

  expect(actual).toEqual([]);
});

test('intersection of [1, 2, 3] only should return [1, 2, 3]', () => {
  const actual = intersectionOf([1, 2, 3]);

  expect(actual).toEqual([1, 2, 3]);
});

test('intersection of [] and [1, 2, 3] should return []', () => {
  const actual = intersectionOf([], [1, 2, 3]);

  expect(actual).toEqual([]);
});

test('intersection of [1, 2, 3] and [] should return []', () => {
  const actual = intersectionOf([1, 2, 3], []);

  expect(actual).toEqual([]);
});
