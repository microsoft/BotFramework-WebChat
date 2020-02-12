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

  const actual = await pageObjects.runHook('useLocalizerForBytes', [], localizeBytes => [
    localizeBytes(10),
    localizeBytes(1024),
    localizeBytes(1048576),
    localizeBytes(1073741824)
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
