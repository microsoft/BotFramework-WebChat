import { Key } from 'selenium-webdriver';
import { timeouts } from './constants.json';

import uiConnected from './setup/conditions/uiConnected';
import suggestedActionsShowed from './setup/conditions/suggestedActionsShowed';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should not focus send box after clicking on send button', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('echo 123');
  await pageObjects.clickSendButton();

  await expect(pageObjects.hasFocusOnSendBoxTextBox()).resolves.toBeFalsy();
});

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should not focus send box after clicking on suggested actions', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions');

  await driver.wait(suggestedActionsShowed(), timeouts.directLine);

  await pageObjects.clickSuggestedActionButton(0);

  await expect(pageObjects.hasFocusOnSendBoxTextBox()).resolves.toBeFalsy();
});

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should focus send box after pressing ENTER to send message', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('echo 123', Key.RETURN);

  await expect(pageObjects.hasFocusOnSendBoxTextBox()).resolves.toBeTruthy();
});
