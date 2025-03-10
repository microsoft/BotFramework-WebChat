/**
 * @jest-environment ../../../__tests__/setup/jestNodeEnvironmentWithTimezone.js
 * @timezone Asia/Tokyo
 */

import dateToLocaleISOString from './dateToLocaleISOString';

test('formatting a time in Japan timezone', () => {
  // eslint-disable-next-line no-magic-numbers
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 567));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"2000-01-01T09:12:34.567+09:00"`);
});
