import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return true if disabled set to true in props', async () => {
  const { pageObjects } = await setupWebDriver({ props: { disabled: true } });

  const [disabled] = await pageObjects.runHook('useDisabled');

  expect(disabled).toMatchInlineSnapshot(`true`);
});

test('getter should return false if disabled is not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [disabled] = await pageObjects.runHook('useDisabled');

  expect(disabled).toMatchInlineSnapshot(`false`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setDisabled] = await pageObjects.runHook('useDisabled');

  expect(setDisabled).toBeFalsy();
});
