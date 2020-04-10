import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling localize should return a localized string', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useLocalize', ['TEXT_INPUT_SPEAK_BUTTON_ALT'])).resolves.toBe('Speak');
});

test('calling localize on "yue" should return a localized string', async () => {
  const { pageObjects } = await setupWebDriver({ props: { locale: 'yue' } });

  await expect(pageObjects.runHook('useLocalize', ['TEXT_INPUT_SPEAK_BUTTON_ALT'])).resolves.toBe('講嘢');
});

test('calling localize on "zh-YUE" should return a localized string using "yue"', async () => {
  const { pageObjects } = await setupWebDriver({ props: { locale: 'zh-YUE' } });

  await expect(pageObjects.runHook('useLocalize', ['TEXT_INPUT_SPEAK_BUTTON_ALT'])).resolves.toBe('講嘢');
});
