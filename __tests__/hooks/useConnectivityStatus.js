import { timeouts } from '../constants.json';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return online', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  const [connectivityStatus] = await pageObjects.runHook('useConnectivityStatus');

  expect(connectivityStatus).toMatchInlineSnapshot(`"connected"`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setConnectivityStatus] = await pageObjects.runHook('useConnectivityStatus');

  expect(setConnectivityStatus).toBeFalsy();
});
