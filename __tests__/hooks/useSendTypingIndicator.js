import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get sendTypingIndicator from props', async () => {
  const { pageObjects } = await setupWebDriver({ props: { sendTypingIndicator: true } });

  await expect(pageObjects.runHook('useSendTypingIndicator', [], result => result[0])).resolves.toBeTruthy();
});

test('getter should get default value if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useSendTypingIndicator', [], result => result[0])).resolves.toBeFalsy();
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setSendTypingIndicator] = await pageObjects.runHook('useSendTypingIndicator');

  expect(setSendTypingIndicator).toBeFalsy();
});
