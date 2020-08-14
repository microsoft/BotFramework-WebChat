import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('setter should convert emoticon to emoji on single character addition', async () => {
  const { pageObjects } = await setupWebDriver({ props: { styleOptions: { emojiSet: true } } });

  await pageObjects.runHook('useTextBoxValue', [], getterSetter =>
    getterSetter[1]('Hello :', { selectionEnd: 7, selectionStart: 7 })
  );

  await pageObjects.runHook('useTextBoxValue', [], getterSetter =>
    getterSetter[1]('Hello :)', { selectionEnd: 8, selectionStart: 8 })
  );

  await expect(pageObjects.runHook('useTextBoxValue', [], getterSetter => getterSetter[0])).resolves.toBe('Hello 😊');
});
