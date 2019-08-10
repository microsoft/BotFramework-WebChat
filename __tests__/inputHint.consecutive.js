import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negateCondition from './setup/conditions/negate';
import speechRecognitionStartCalled from './setup/conditions/speechRecognitionStartCalled';
import speechSynthesisUtterancePended from './setup/conditions/speechSynthesisUtterancePended';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('input hint from consecutive messages', () => {
  // | 1st activity    | 2nd activity    | Should turn on microphone if via microphone |
  // |-----------------|-----------------|---------------------------------------------|
  // | Accepting input | Accepting input | No                                          |
  // | Accepting input | Expecting input | Yes                                         |
  // | Accepting input | Ignoring input  | No                                          |
  // |                 |                 |                                             |
  // | Expecting input | Accepting input | Yes                                         |
  // | Expecting input | Expecting input | Yes                                         |
  // | Expecting input | Ignoring input  | No (explicitly turn it off)                 |
  // |                 |                 |                                             |
  // | Ignoring input  | Accepting input | No                                          |
  // | Ignoring input  | Expecting input | Yes                                         |
  // | Ignoring input  | Ignoring input  | No                                          |

  let driver, pageObjects;

  async function sendInputHintCommand(first, second) {
    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendMessageViaMicrophone(`input-hint ${first} ${second}`);

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await pageObjects.startSpeechSynthesize();
    await pageObjects.endSpeechSynthesize();
    await pageObjects.startSpeechSynthesize();
    await pageObjects.endSpeechSynthesize();

    await driver.wait(negateCondition(speechSynthesisUtterancePended()), timeouts.ui);
  }

  beforeEach(async () => {
    const result = await setupWebDriver({ props: { webSpeechPonyfillFactory: () => window.WebSpeechMock } });

    driver = result.driver;
    pageObjects = result.pageObjects;
  });

  test('should turn on microphone for accepting then accepting', async () => {
    await sendInputHintCommand('accepting', 'accepting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
  });

  test('should turn on microphone for accepting then expecting', async () => {
    await sendInputHintCommand('accepting', 'expecting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeTruthy();
  });

  test('should turn on microphone for accepting then ignoring', async () => {
    await sendInputHintCommand('accepting', 'ignoring');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
  });

  test('should turn on microphone for expecting then accepting', async () => {
    await sendInputHintCommand('expecting', 'accepting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeTruthy();
  });

  test('should turn on microphone for expecting then expecting', async () => {
    await sendInputHintCommand('expecting', 'expecting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeTruthy();
  });

  test('should turn on microphone for expecting then ignoring', async () => {
    await sendInputHintCommand('expecting', 'ignoring');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
  });

  test('should turn on microphone for ignoring then accepting', async () => {
    await sendInputHintCommand('ignoring', 'accepting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
  });

  test('should turn on microphone for ignoring then expecting', async () => {
    await sendInputHintCommand('ignoring', 'expecting');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeTruthy();
  });

  test('should turn on microphone for ignoring then ignoring', async () => {
    await sendInputHintCommand('ignoring', 'ignoring');

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
  });
});
