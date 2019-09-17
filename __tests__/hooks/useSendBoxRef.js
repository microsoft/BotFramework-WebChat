import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling postActivity should send an activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('Hello, World!');
  await expect(pageObjects.runHook('useSendBoxRef', [], sendBox => sendBox.current.value)).resolves.toBe(
    'Hello, World!'
  );
});
