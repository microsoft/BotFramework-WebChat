import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import sendBoxTextBoxFocused from './setup/conditions/sendBoxTextBoxFocused';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should not focus send box after clicking on send button', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('echo 123');
  await pageObjects.clickSendButton();

  await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();
});

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should not focus send box after clicking on suggested actions', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions');

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  await pageObjects.clickSuggestedActionButton(0);

  await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();
});

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should focus send box after pressing ENTER to send message', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('echo 123', Key.RETURN);

  await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeTruthy();
});

describe('type focus sink', () => {
  test('should type in the send box when focus is on the transcript', async () => {
    const { driver } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await driver.findElement(By.css('[role="log"]'));

    await transcript.click();

    await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();

    await driver
      .actions()
      .sendKeys('echo 123')
      .sendKeys(Key.RETURN)
      .perform();

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should not type in the send box when focus is on a text box of an Adaptive Card', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendMessageViaSendBox('card inputs');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

    await driver.executeScript(() => document.querySelector('input[placeholder="Name"]').focus());
    await driver
      .actions()
      .sendKeys('echo 123')
      .sendKeys(Key.RETURN)
      .perform();

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should not focus on the send box when SHIFT is pressed', async () => {
    const { driver } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await driver.findElement(By.css('[role="log"]'));

    await transcript.click();

    await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();

    await driver
      .actions()
      .sendKeys(Key.SHIFT)
      .perform();

    await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();
  });

  test('should paste into the send box when focus is on the transcript', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await pageObjects.sendTextToClipboard('Hello, World!');

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await driver.findElement(By.css('[role="log"]'));

    await transcript.click();

    await expect(sendBoxTextBoxFocused().fn(driver)).resolves.toBeFalsy();

    await driver
      .actions()
      .keyDown(Key.CONTROL)
      .sendKeys('v')
      .keyUp(Key.CONTROL)
      .perform();

    await driver.wait(sendBoxTextBoxFocused(), timeouts.ui);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should not paste in the send box when focus is on a text box of an Adaptive Card', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await pageObjects.sendTextToClipboard('Hello, World!');

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendMessageViaSendBox('card inputs');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

    await driver.executeScript(() => document.querySelector('input[placeholder="Name"]').focus());
    await driver
      .actions()
      .keyDown(Key.CONTROL)
      .sendKeys('v')
      .keyUp(Key.CONTROL)
      .perform();

    await driver.wait(
      driver => driver.executeScript(() => document.querySelector('input[placeholder="Name"]').value),
      timeouts.ui
    );

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
