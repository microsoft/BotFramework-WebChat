import filterMap from './filterMap';

test('filter an item out of 3', () => {
  const map = { one: 1, two: 2, three: 3 };
  const actual = filterMap(map, value => value !== 1);

  expect(actual).toEqual({ two: 2, three: 3 });
  expect(actual).not.toBe(map);
});

test('filter all items', () => {
  const map = { one: 1, two: 2, three: 3 };
  const actual = filterMap(map, value => !value);

  expect(actual).toEqual({});
  expect(actual).not.toBe(map);
});

test('filter no items', () => {
  const map = { one: 1, two: 2, three: 3 };
  const actual = filterMap(map, value => value);

  expect(actual).toEqual({ one: 1, two: 2, three: 3 });

  // If the result is not filtered, we will return the original map
  expect(actual).toBe(map);
});
