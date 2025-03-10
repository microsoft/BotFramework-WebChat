import { Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import getTranscript from './setup/elements/getTranscript.js';
import getTranscriptScrollable from './setup/elements/getTranscriptScrollable.js';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negationOf from './setup/conditions/negationOf.js';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import sendBoxTextBoxFocused from './setup/conditions/sendBoxTextBoxFocused';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should focus send box after clicking on suggested actions', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions');

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  await pageObjects.clickSuggestedActionButton(0);

  await driver.wait(sendBoxTextBoxFocused(), timeouts.ui);
});

// Verification of fix of #1971, https://github.com/microsoft/BotFramework-WebChat/issues/1971
test('should focus send box after pressing ENTER to send message', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox('echo 123', Key.RETURN);

  await driver.wait(sendBoxTextBoxFocused(), timeouts.ui);
});

describe('type focus sink', () => {
  test('should type in the send box when focus is on the transcript', async () => {
    const { driver } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await getTranscript(driver);

    await transcript.click();

    await driver.wait(negationOf(sendBoxTextBoxFocused()), timeouts.ui);

    await driver.actions().sendKeys('echo 123').sendKeys(Key.RETURN).perform();

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

    // For reliability reason, we are scrolling to top before focus
    // This will make sure the "New messages" button show up
    await pageObjects.scrollToTop();

    const transcriptScrollable = await getTranscriptScrollable(driver);

    await driver.executeScript(
      transcriptScrollable => transcriptScrollable.querySelector('input[placeholder="Name"]').focus(),
      transcriptScrollable
    );
    await driver.actions().sendKeys('echo 123').sendKeys(Key.RETURN).perform();

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should not focus on the send box when SHIFT is pressed', async () => {
    const { driver } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await getTranscript(driver);

    await transcript.click();

    await driver.wait(negationOf(sendBoxTextBoxFocused()), timeouts.ui);

    await driver.actions().sendKeys(Key.SHIFT).perform();

    await driver.wait(negationOf(sendBoxTextBoxFocused()), timeouts.ui);
  });

  test('should paste into the send box when focus is on the transcript', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await pageObjects.sendTextToClipboard('Hello, World!');

    await driver.wait(uiConnected(), timeouts.directLine);

    const transcript = await getTranscript(driver);

    await transcript.click();

    await driver.wait(negationOf(sendBoxTextBoxFocused()), timeouts.ui);

    await driver.actions().keyDown(Key.CONTROL).sendKeys('v').keyUp(Key.CONTROL).perform();

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

    const transcriptScrollable = await getTranscriptScrollable(driver);

    await driver.executeScript(
      transcriptScrollable => transcriptScrollable.querySelector('input[placeholder="Name"]').focus(),
      transcriptScrollable
    );
    await driver.actions().keyDown(Key.CONTROL).sendKeys('v').keyUp(Key.CONTROL).perform();

    await driver.wait(
      driver =>
        driver.executeScript(
          transcriptScrollable => transcriptScrollable.querySelector('input[placeholder="Name"]').value,
          transcriptScrollable
        ),
      timeouts.ui
    );

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
