import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return bytes for "ja-JP"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'ja-JP'
    }
  });

  const actual = await pageObjects.runHook('useByteFormatter', [], formatByte => [
    formatByte(10),
    formatByte(1024),
    formatByte(1048576),
    formatByte(1073741824)
  ]);

  expect(actual).toMatchInlineSnapshot(`
    Array [
      "10 バイト",
      "1 KB",
      "1 MB",
      "1 GB",
    ]
  `);
});
