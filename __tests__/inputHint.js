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

      // After synthesis completed, we will dispatch START_DICTATE action.
      // The action will trigger a re-render and the useEffect() will kickoff speech recognition.
      // There could be a slight time delay between "end of synthesis" and "kickoff recognition".
      await driver.wait(speechRecognitionStartCalled(), timeouts.ui);
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
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

      // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
      await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
        'Waiting SpeechRecognition.start to be called'
      );
    });
  });
});
