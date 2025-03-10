import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negationOf from './setup/conditions/negationOf';
import speechRecognitionStartCalled from './setup/conditions/speechRecognitionStartCalled';
import speechSynthesisUtterancePended from './setup/conditions/speechSynthesisUtterancePended';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('speech synthesis', () => {
  // Verification of fix of #1736, https://github.com/microsoft/BotFramework-WebChat/issues/1736
  test('should synthesize two consecutive messages', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('echo 123');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty(
      'text',
      'Echoing back in a separate activity.'
    );

    await pageObjects.endSpeechSynthesize();

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty('text', '123');

    await pageObjects.endSpeechSynthesize();
  });

  // Verification of fix of #2096, https://github.com/microsoft/BotFramework-WebChat/issues/2096
  test('should synthesize speak property of Adaptive Card', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('card bingsports');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty(
      'text',
      'Showing  bingsports\r\nThe Seattle Seahawks beat the Carolina Panthers 40-7'
    );

    await pageObjects.endSpeechSynthesize();
  });

  test('should start recognition after failing on speech synthesis with activity of expecting input', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('hint expecting');

    // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
    await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
      'Waiting SpeechRecognition.start to be called'
    );
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await pageObjects.startSpeechSynthesize();
    await pageObjects.errorSpeechSynthesize();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);
  });

  test('should not synthesis if engine is explicitly configured off', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => {
          const { SpeechGrammarList, SpeechRecognition } = window.WebSpeechMock;

          return {
            SpeechGrammarList,
            SpeechRecognition,
            speechSynthesis: null,
            SpeechSynthesisUtterance: null
          };
        }
      }
    });

    await pageObjects.sendMessageViaMicrophone('Hello, World!');

    // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
    await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
      'Waiting SpeechRecognition.start to be called'
    );
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    expect(await pageObjects.getConsoleErrors()).toEqual([]);
  });

  test('should stop synthesis after clicking on microphone button', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('echo Hello, World!');

    // TODO: [P3] #4046 Improves test reliability by identifying false positives and reduce wait time.
    await expect(() => driver.wait(speechRecognitionStartCalled(), timeouts.ui)).rejects.toThrow(
      'Waiting SpeechRecognition.start to be called'
    );
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty(
      'text',
      'Echoing back in a separate activity.'
    );

    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await pageObjects.clickMicrophoneButton();

    await driver.wait(speechRecognitionStartCalled(), timeouts.ui);
    await driver.wait(negationOf(speechSynthesisUtterancePended()), timeouts.ui);
  });

  describe('without speech synthesis', () => {
    test('should start recognition immediately after receiving expected input hint', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          webSpeechPonyfillFactory: () => {
            const { SpeechGrammarList, SpeechRecognition } = window.WebSpeechMock;

            return {
              SpeechGrammarList,
              SpeechRecognition
            };
          }
        }
      });

      await pageObjects.sendMessageViaMicrophone('hint expected');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await driver.wait(speechRecognitionStartCalled(), timeouts.ui);
      await driver.wait(negationOf(speechSynthesisUtterancePended()), timeouts.ui);
    });
  });
});
