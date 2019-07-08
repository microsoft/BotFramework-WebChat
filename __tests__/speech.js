import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import suggestedActionsShowed from './setup/conditions/suggestedActionsShowed';
import speechRecognitionStarted from './setup/conditions/speechRecognitionStarted';
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
          .then(() => loadScript('/mockWebSpeech.js'))
          .then(() => window.mockWebSpeechPonyfill()),
      props: {
        webSpeechPonyfillFactory: () => ({
          SpeechGrammarList: window.SpeechGrammarList,
          SpeechRecognition: window.SpeechRecognition
        })
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStarted(), 1000);
    await driver.executeScript(() => window.SpeechRecognitionMock.queue('recognize', 'Hello, World!'));

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
