import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return language set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const [language] = await pageObjects.runHook('useLanguage');

  expect(language).toMatchInlineSnapshot(`"yue"`);
});

test('getter should return "yue" for "zh-YUE"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'zh-YUE'
    }
  });

  const [language] = await pageObjects.runHook('useLanguage');

  expect(language).toMatchInlineSnapshot(`"yue"`);
});

test('getter should return speech language "zh-HK" for "yue"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const [language] = await pageObjects.runHook('useLanguage', ['speech']);

  expect(language).toMatchInlineSnapshot(`"zh-HK"`);
});

test('getter should return default language if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [language] = await pageObjects.runHook('useLanguage');

  expect(language).toMatchInlineSnapshot(`"en-US"`);
});

test('setter should be undefined', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setLanguage] = await pageObjects.runHook('useLanguage');

  expect(setLanguage).toBeUndefined();
});
