import { timeouts } from './constants.json';

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
          .then(() => loadScript('/mockWebSpeech.js')),
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStarted(), timeouts.ui);
    await pageObjects.putSpeechRecognitionResult('recognize', 'Hello, World!');

    const utterance = await pageObjects.takeSpeechSynthesizeUtterance();

    expect(utterance).toHaveProperty(
      'text',
      `Unknown command: I don't know Hello, World!. You can say \"help\" to learn more.`
    );

    await driver.wait(speechRecognitionStarted(), timeouts.ui);
  });
});
