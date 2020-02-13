import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return string for "yue"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('TEXT_INPUT_SPEAK_BUTTON_ALT'));

  expect(actual).toMatchInlineSnapshot(`"講嘢"`);
});

test('should return string for default language', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {}
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('TEXT_INPUT_SPEAK_BUTTON_ALT'));

  expect(actual).toMatchInlineSnapshot(`"Speak"`);
});

test('should return empty string for non-existent ID', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {}
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('NON_EXISTENT'));

  expect(actual).toMatchInlineSnapshot(`""`);
});

test('should return overrode string for non-existent ID', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue',
      overrideLocalizedStrings: {
        SOMETHING_NEW: 'Something new'
      }
    }
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('SOMETHING_NEW'));

  expect(actual).toMatchInlineSnapshot(`"Something new"`);
});
