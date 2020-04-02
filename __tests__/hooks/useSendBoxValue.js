import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get the send box text', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox('Hello, World!');
  await expect(pageObjects.runHook('useSendBoxValue', [], result => result[0])).resolves.toBe('Hello, World!');
});

test('setter should set the send box text', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useSendBoxValue', [], result => result[1]('Hello, World!'));
  await expect(pageObjects.getSendBoxText()).resolves.toBe('Hello, World!');
});
