/**
 * @jest-environment ../../../__tests__/setup/jestNodeEnvironmentWithTimezone.js
 * @timezone Etc/UTC
 */

import dateToLocaleISOString from './dateToLocaleISOString';

test('formatting a time in UTC timezone', () => {
  // eslint-disable-next-line no-magic-numbers
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 567));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"2000-01-01T00:12:34.567Z"`);
});

test('formatting a time in UTC timezone with zero milliseconds', () => {
  // eslint-disable-next-line no-magic-numbers
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 0));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"2000-01-01T00:12:34.000Z"`);
});
