import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter/setter should get/set value', async () => {
  const { pageObjects } = await setupWebDriver({ props: { styleOptions: { emojiSet: true } } });

  await pageObjects.runHook('useTextBoxValue', [], getterSetter => getterSetter[1]('Hello, World!'));

  await expect(pageObjects.runHook('useTextBoxValue', [], getterSetter => getterSetter[0])).resolves.toBe(
    'Hello, World!'
  );
});

// TODO: Add test to make sure dictation is stopped.
