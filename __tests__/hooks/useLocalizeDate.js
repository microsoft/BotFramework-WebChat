import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling localizeDate should return a localized date time string', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(
    pageObjects.runHook('useLocalizeDate', [new Date(2000, 0, 2, 12, 34, 56)])
  ).resolves.toMatchInlineSnapshot(`"January 02, 20:34"`);
});
