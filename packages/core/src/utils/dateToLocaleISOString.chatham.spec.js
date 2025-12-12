/**
 * @jest-environment ../../../__tests__/setup.unit/JestNodeEnvironmentWithTimezone.js
 * @timezone Pacific/Chatham
 */

import dateToLocaleISOString from './dateToLocaleISOString';

test('formatting a time in Chatham Islands timezone', () => {
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 567));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"2000-01-01T13:57:34.567+13:45"`);
});
