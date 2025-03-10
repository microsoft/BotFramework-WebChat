/**
 * @jest-environment ../../../__tests__/setup/jestNodeEnvironmentWithTimezone.js
 * @timezone America/Los_Angeles
 */

import dateToLocaleISOString from './dateToLocaleISOString';

test('formatting a time in Pacific Standard Time timezone', () => {
  // eslint-disable-next-line no-magic-numbers
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 567));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"1999-12-31T16:12:34.567-08:00"`);
});
