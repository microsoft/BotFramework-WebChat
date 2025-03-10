/* eslint no-magic-numbers: "off" */

import mapMap from './mapMap';

test('multiply a map by 10', () => {
  const map = { ten: 1, twenty: 2 };
  const actual = mapMap(map, value => value * 10);

  expect(actual).toEqual({ ten: 10, twenty: 20 });
  expect(actual).not.toBe(map);
});
