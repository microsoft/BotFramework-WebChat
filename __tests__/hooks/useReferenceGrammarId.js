import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test.todo('getter should return reference grammar ID');

test('setter should throw an exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useReferenceGrammarID', [], result => result[1]())).rejects.toThrow();
});
