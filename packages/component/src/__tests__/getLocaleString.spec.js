import getLocaleString from '../../lib/Localization/getLocaleString';

test('should return formatted date for "en"', async () => {
  const actual = getLocaleString('2000-12-23T12:34:56.789Z', 'en');

  expect(actual).toMatchInlineSnapshot(`"December 23 at 4:34 AM"`);
});

test('should return formatted date for "yue"', async () => {
  const actual = getLocaleString('2000-12-23T12:34:56.789Z', 'yue');

  expect(actual).toMatchInlineSnapshot(`"12月23日 上午4:34"`);
});
