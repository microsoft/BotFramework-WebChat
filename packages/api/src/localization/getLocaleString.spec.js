/* eslint no-magic-numbers: "off" */

import getLocaleString from './getLocaleString';

test('should return formatted date for "en"', () => {
  const actual = getLocaleString(new Date(2000, 11, 23, 12, 34, 56, 789), 'en');

  expect(actual).toMatchInlineSnapshot(`"December 23 at 12:34 PM"`);
});

test('should return formatted date for "yue"', () => {
  const actual = getLocaleString(new Date(2000, 11, 23, 12, 34, 56, 789), 'yue');

  expect(actual).toMatchInlineSnapshot(`"12月23日 下午12:34"`);
});
