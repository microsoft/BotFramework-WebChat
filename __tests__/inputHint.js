import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import speechRecognitionStartCalled from './setup/conditions/speechRecognitionStartCalled';
import speechSynthesisUtterancePended from './setup/conditions/speechSynthesisUtterancePended';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('input hint', () => {
  describe('of expectingInput', () => {
    test('should turn on microphone if initiated via microphone', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint expecting');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeTruthy();
    });

    test('should not turn on microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint expecting');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });
  });

  describe('of acceptingInput', () => {
    test('should not turn on microphone if initiated via microphone', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint accepting');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });

    test('should not turn on microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaSendBox('hint accepting');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });
  });

  describe('of ignoringInput', () => {
    test('should turn off microphone if initiated via microphone', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint ignoring');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });

    test('should turn off microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaSendBox('hint ignoring');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });
  });

  describe('of undefined', () => {
    test('should not turn on microphone if initiated via microphone', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint undefined');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });

    test('should not turn on microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaSendBox('hint undefined');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(speechRecognitionStartCalled().fn(driver)).resolves.toBeFalsy();
    });
  });
});
