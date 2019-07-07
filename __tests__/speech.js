import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import suggestedActionsShowed from './setup/conditions/suggestedActionsShowed';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('speech recognition', () => {
  test('should send on successful recognition', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      setup: () =>
        Promise.resolve()
          .then(() => loadScript('https://unpkg.com/event-target-shim@5.0.1/dist/event-target-shim.umd.js'))
          .then(() => loadScript('/mockWebSpeech.js')),
      props: {
        webSpeechPonyfillFactory: () =>
          window.createMockWebSpeechPonyfill({
            setupSpeechRecognition: speechRecognition => {
              speechRecognition.recognize('Hello, World!');
            }
          })
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });
    await pageObjects.clickMicrophoneButton();
    // await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    // await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });
    // await driver.wait(suggestedActionsShowed(), timeouts.directLine);
    // await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

    // const submitButton = await driver.findElement(By.css('button.ac-pushButton:nth-of-type(2)'));

    // await submitButton.click();
    // await driver.wait(minNumActivitiesShown(5), timeouts.directLine);
    // await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
