import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should stick to bottom if submitting an Adaptive Card while suggested actions is open', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });
  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  const submitButton = await driver.findElement(By.css('button.ac-pushButton:nth-of-type(2)'));

  await submitButton.click();
  await driver.wait(minNumActivitiesShown(5), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('clicking "New messages" button should scroll to end and stick to bottom', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('help');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.executeScript(() => {
    document.querySelector('[role="log"] > *').scrollTop = 0;
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.clickScrollToBottomButton();
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.sendMessageViaSendBox('Hello, World!');
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
