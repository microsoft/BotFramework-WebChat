import { timeouts } from '../constants.json';

import sendBoxTextBoxFocused from '../setup/conditions/sendBoxTextBoxFocused';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling emitTypingIndicator should send a typing activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useFocusSendBox', [], fn => fn());

  await driver.wait(sendBoxTextBoxFocused(), timeouts.ui);
});
