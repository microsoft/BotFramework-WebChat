/**
 * @jest-environment ../../../__tests__/unit.setup/JestNodeEnvironmentWithTimeZone.js
 * @timezone America/St_Johns
 */

import dateToLocaleISOString from './dateToLocaleISOString';

test('formatting a time in Cananda, Newfoundland timezone', () => {
  const date = new Date(Date.UTC(2000, 0, 1, 0, 12, 34, 567));
  const actual = dateToLocaleISOString(date);

  expect(actual).toMatchInlineSnapshot(`"1999-12-31T20:42:34.567-03:30"`);
});
