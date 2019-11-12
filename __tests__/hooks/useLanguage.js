import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return language set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'zh-YUE'
    }
  });

  const [groupTimestamp] = await pageObjects.runHook('useLanguage');

  expect(groupTimestamp).toMatchInlineSnapshot(`"zh-YUE"`);
});

test('getter should return default language if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [groupTimestamp] = await pageObjects.runHook('useLanguage');

  expect(groupTimestamp).toMatchInlineSnapshot(`"en-US"`);
});

test('setter should be undefined', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setLanguage] = await pageObjects.runHook('useLanguage');

  expect(setLanguage).toBeUndefined();
});
