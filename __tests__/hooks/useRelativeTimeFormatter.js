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

  const actual = await pageObjects.runHook('useRelativeTimeFormatter', [], formatRelativeTime => [
    formatRelativeTime(Date.now()),
    formatRelativeTime(new Date()),
    formatRelativeTime(new Date().toISOString()),
    formatRelativeTime(Date.now() - 60000),
    formatRelativeTime(Date.now() - 120000),
    formatRelativeTime(Date.now() - 3600000),
    formatRelativeTime(Date.now() - 7200000),
    formatRelativeTime(Date.now() - 86400000),
    formatRelativeTime(Date.now() - 172800000)
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
