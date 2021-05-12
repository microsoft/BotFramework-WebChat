/* eslint no-magic-numbers: "off" */

import { getLocaleString, localize } from './Localize';

const originalWarn = console.warn;
let warnings;

beforeEach(() => {
  warnings = [];
  console.warn = message => warnings.push(message);
});

afterEach(() => {
  console.warn = originalWarn;
});

test('localize should return the string', () => {
  const actual = localize('CONNECTIVITY_STATUS_ALT', 'yue', 'CONNECTED');

  expect(actual).toMatchInlineSnapshot(`"接駁情況：CONNECTED"`);
  expect(warnings.find(message => /deprecate/iu.test(message)));
});

test('localize should return the English string for non-existing language', () => {
  const actual = localize('CONNECTIVITY_STATUS_ALT', 'xyz', 'CONNECTED');

  expect(actual).toMatchInlineSnapshot(`"Connectivity Status: CONNECTED"`);
  expect(warnings.find(message => /deprecate/iu.test(message)));
});

test('localize should return empty string for non-existing ID', () => {
  const actual = localize('xyz', 'yue');

  expect(actual).toMatchInlineSnapshot(`""`);
  expect(warnings.find(message => /deprecate/iu.test(message)));
});

test('getLocaleString for "en"', () => {
  const actual = getLocaleString(new Date(2000, 12, 23, 12, 34, 56, 789), 'en');

  expect(actual).toMatchInlineSnapshot(`"January 23 at 12:34 PM"`);
  expect(warnings.find(message => /deprecate/iu.test(message)));
});
