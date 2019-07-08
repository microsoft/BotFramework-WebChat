import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import speechRecognitionStarted from './setup/conditions/speechRecognitionStarted';
import speechSynthesisPending from './setup/conditions/speechSynthesisPending';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('speech recognition', () => {
  test('should send on successful recognition', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    const microphoneButton = await pageObjects.getMicrophoneButton();

    await microphoneButton.click();

    await driver.wait(speechRecognitionStarted(), timeouts.ui);
    await pageObjects.putSpeechRecognitionResult('recognize', 'Hello, World!');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    const utterance = await pageObjects.takeSpeechSynthesizeUtterance();

    expect(utterance).toHaveProperty(
      'text',
      `Unknown command: I don't know Hello, World!. You can say \"help\" to learn more.`
    );

    await driver.wait(speechRecognitionStarted(), timeouts.ui);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should not start recognition after typing on keyboard', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    const microphoneButton = await pageObjects.getMicrophoneButton();

    await microphoneButton.click();

    await driver.wait(speechRecognitionStarted(), timeouts.ui);
    await pageObjects.putSpeechRecognitionResult('recognize', 'Hello, World!');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    await driver.wait(speechSynthesisPending(), timeouts.ui);

    const sendBoxTextBox = await pageObjects.getSendBoxTextBox();

    await sendBoxTextBox.sendKeys('Aloha!');

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    await pageObjects.takeSpeechSynthesizeUtterance();

    expect(pageObjects.isRecognizingSpeech()).resolves.toBeFalsy();
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
