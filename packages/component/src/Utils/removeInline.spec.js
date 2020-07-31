import removeInline from './removeInline';

test('remove single occurrence', () => {
  const actual = [1, 2, 3, 4, 5];
  const original = actual;

  removeInline(actual, 3);

  expect(original).toBe(actual);
  expect(actual).toEqual([1, 2, 4, 5]);
});

test('remove multiple occurrences', () => {
  const actual = [2, 2, 4, 4, 6, 6];
  const original = actual;

  removeInline(actual, 4);

  expect(original).toBe(actual);
  expect(actual).toEqual([2, 2, 6, 6]);
});

test('remove no occurrences', () => {
  const actual = [2, 2, 4, 4, 6, 6];
  const original = actual;

  removeInline(actual, 1);

  expect(original).toBe(actual);
  expect(actual).toEqual([2, 2, 4, 4, 6, 6]);
});
