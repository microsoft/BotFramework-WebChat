import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import { negate as speechRecognitionNotStarted } from './setup/conditions/speechRecognitionStarted';
import speechSynthesisPending, { negate as speechSynthesisNotPending } from './setup/conditions/speechSynthesisPending';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('speech recognition', () => {
  test('should not start recognition after typing on keyboard while synthesizing', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('Hello, World!');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(speechSynthesisPending(), timeouts.ui);

    const utterance = await pageObjects.startSpeechSynthesize();

    expect(utterance).toHaveProperty(
      'text',
      `Unknown command: I don't know Hello, World!. You can say \"help\" to learn more.`
    );

    const sendBoxTextBox = await pageObjects.getSendBoxTextBox();

    await sendBoxTextBox.sendKeys('Aloha!');

    await driver.wait(speechSynthesisNotPending(), timeouts.ui);
    await driver.wait(speechRecognitionNotStarted(), timeouts.ui);

    expect(pageObjects.isRecognizingSpeech()).resolves.toBeFalsy();
  });
});
