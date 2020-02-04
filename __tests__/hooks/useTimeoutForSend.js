import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return timeout for sending activity', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        sendTimeout: 1000
      }
    }
  });

  const [timeoutForSend] = await pageObjects.runHook('useTimeoutForSend');

  expect(timeoutForSend).toMatchInlineSnapshot(`1000`);
});

test('getter should return timeout for sending activity if set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      sendTimeout: 1000
    }
  });

  const [timeoutForSend] = await pageObjects.runHook('useTimeoutForSend');

  expect(timeoutForSend).toMatchInlineSnapshot(`1000`);
});

test('getter should return default timeout for sending activity if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [timeoutForSend] = await pageObjects.runHook('useTimeoutForSend');

  expect(timeoutForSend).toMatchInlineSnapshot(`20000`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setTimeoutForSend] = await pageObjects.runHook('useTimeoutForSend');

  expect(setTimeoutForSend).toBeFalsy();
});
