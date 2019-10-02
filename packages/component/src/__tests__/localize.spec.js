/* eslint no-magic-numbers: "off" */

import { localize } from '../Localization/Localize';

function testJapaneseTime(testDate, expectedResult) {
  const result = localize('X minutes ago', 'ja-JP', testDate);

  expect(result).toEqual(expectedResult);
}

test('Japanese timestamp localization now', () => {
  const expected = 'たった今';

  testJapaneseTime(Date.now() - 1000, expected);
  testJapaneseTime(Date.now() - 30000, expected);
  testJapaneseTime(Date.now() - 50000, expected);
  testJapaneseTime(Date.now() - 59000, expected);
});

test('Japanese timestamp localization within 1 hour', () => {
  testJapaneseTime(Date.now() - 61000, '1 分前');
  testJapaneseTime(Date.now() - 120001, '2 分前');
  testJapaneseTime(Date.now() - 3540000, '59 分前');
});

test('Japanese timestamp localization within 5 hours', () => {
  const oneHour = 3600000;

  testJapaneseTime(Date.now() - oneHour, '1 時間前');
  testJapaneseTime(Date.now() - oneHour * 2, '2 時間前');
  testJapaneseTime(Date.now() - oneHour * 4, '4 時間前');
});

test('Japanese timestamp localization today', () => {
  const oneHour = 3600000;

  testJapaneseTime(Date.now() - oneHour * 5, '今日');
  testJapaneseTime(Date.now() - oneHour * 6, '今日');
  testJapaneseTime(Date.now() - oneHour * 23, '今日');
});

test('Japanese timestamp localization yesterday', () => {
  const oneHour = 3600000;

  testJapaneseTime(Date.now() - oneHour * 25, '昨日');
  testJapaneseTime(Date.now() - oneHour * 36, '昨日');
  testJapaneseTime(Date.now() - oneHour * 47, '昨日');
  testJapaneseTime(Date.now() - oneHour * 48, '昨日');
});

test('Japanese timestamp localization longer than yesterday', () => {
  const oneHour = 3600000;
  const formatter = new Intl.DateTimeFormat('ja-JP').format;

  testJapaneseTime(Date.now() - oneHour * 49, formatter(Date.now() - oneHour * 49));
  testJapaneseTime(Date.now() - oneHour * 120, formatter(Date.now() - oneHour * 120));
});

test('Japanese timestamp invalid', () => {
  testJapaneseTime('invalid date', 'invalid date');
});
