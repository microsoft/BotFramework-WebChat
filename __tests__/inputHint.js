import { timeouts } from './constants.json';

import isRecognizingSpeech from './setup/pageObjects/isRecognizingSpeech';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import speechSynthesisPending from './setup/conditions/speechSynthesisPending';
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

      await pageObjects.sendMessageViaMicrophone('hint expecting input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisPending(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      expect(isRecognizingSpeech(driver)).resolves.toBeTruthy();
    });

    test('should not turn on microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaMicrophone('hint expecting input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
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

      await pageObjects.sendMessageViaMicrophone('hint accepting input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisPending(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
    });

    test('should not turn on microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaSendBox('hint accepting input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
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

      await pageObjects.sendMessageViaMicrophone('hint ignoring input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechSynthesisPending(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
    });

    test('should turn off microphone if initiated via typing', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendMessageViaSendBox('hint ignoring input');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
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

      await driver.wait(speechSynthesisPending(), timeouts.ui);
      await pageObjects.startSpeechSynthesize();
      await pageObjects.endSpeechSynthesize();

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
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

      expect(isRecognizingSpeech(driver)).resolves.toBeFalsy();
    });
  });
});
