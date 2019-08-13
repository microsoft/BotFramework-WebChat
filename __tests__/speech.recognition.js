import { timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negateCondition from './setup/conditions/negate';
import speechRecognitionStartCalled from './setup/conditions/speechRecognitionStartCalled';
import speechSynthesisUtterancePended from './setup/conditions/speechSynthesisUtterancePended';

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

    await pageObjects.sendMessageViaMicrophone('hint expecting');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await pageObjects.startSpeechSynthesize();
    await pageObjects.typeOnSendBox('Aloha!');

    await driver.wait(negateCondition(speechSynthesisUtterancePended()), timeouts.ui);
    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
  });

  test('should start recognition after clicking on microphone button', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);
  });

  test('should stop recognition after clicking on microphone button while recognizing', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

    await expect(pageObjects.isDictating()).resolves.toBeTruthy();

    await pageObjects.clickMicrophoneButton();

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getSendBoxText()).resolves.toBe('Hello');
  });

  test('should not send anything on muted microphone', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('microphoneMuted');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything on bird tweet', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('birdTweet');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything on unrecognizable speech', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('unrecognizableSpeech');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything on airplane mode', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('airplaneMode');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything when access to microphone is denied', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('accessDenied');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything when abort immediately after audio start', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('abortAfterAudioStart');

    await expect(pageObjects.isDictating()).resolves.toBeTruthy();

    await pageObjects.clickMicrophoneButton();

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
  });

  test('should not send anything if aborted while recognizing', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('recognizeButAborted', 'Hello');

    await expect(pageObjects.isDictating()).resolves.toBeTruthy();

    await pageObjects.clickMicrophoneButton();

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);
    await expect(pageObjects.getSendBoxText()).resolves.toBe('Hello');
  });

  test('should not send anything if recognize is complete but not confident', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

    await pageObjects.putSpeechRecognitionResult('recognizeButNotConfident', 'Hello');

    await expect(pageObjects.isDictating()).resolves.toBeFalsy();
    await expect(pageObjects.getNumActivitiesShown(0)).resolves.toBe(0);

    // Web Speech API will send finalized result with empty string
    await expect(pageObjects.getSendBoxText()).resolves.toBe('');
  });

  test('should set recognition language', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        locale: 'zh-YUE',
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.clickMicrophoneButton();

    await expect(speechRecognitionStartCalled().fn(driver)).resolves.toHaveProperty('lang', 'zh-YUE');
  });
});
