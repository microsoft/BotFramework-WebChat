import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return relative time for "yue"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const actual = await pageObjects.runHook('useLocalizerForRelativeTime', [], localizeRelativeTime => [
    localizeRelativeTime(Date.now()),
    localizeRelativeTime(new Date()),
    localizeRelativeTime(new Date().toISOString()),
    localizeRelativeTime(Date.now() - 60000),
    localizeRelativeTime(Date.now() - 120000),
    localizeRelativeTime(Date.now() - 3600000),
    localizeRelativeTime(Date.now() - 7200000),
    localizeRelativeTime(Date.now() - 86400000),
    localizeRelativeTime(Date.now() - 172800000)
  ]);

  expect(actual).toMatchInlineSnapshot(`
    Array [
      "啱啱",
      "啱啱",
      "啱啱",
      "一分鐘前",
      "2 分鐘前",
      "一個鐘前",
      "2 小時前",
      "今日",
      "尋日",
    ]
  `);
});
