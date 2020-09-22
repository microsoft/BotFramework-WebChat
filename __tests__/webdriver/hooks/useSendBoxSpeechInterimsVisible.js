import { timeouts } from '../__jest__/constants.json';

import negationOf from '../__jest__/conditions/negationOf';
import speechRecognitionStartCalled from '../__jest__/conditions/speechRecognitionStartCalled';
import speechSynthesisUtterancePended from '../__jest__/conditions/speechSynthesisUtterancePended';
import uiConnected from '../__jest__/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('sendBoxSpeechInterimsVisible should return if dictation is started or not', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await expect(
    pageObjects.runHook(
      'useSendBoxSpeechInterimsVisible',
      [],
      sendBoxSpeechInterimsVisible => sendBoxSpeechInterimsVisible[0]
    )
  ).resolves.toMatchInlineSnapshot(`false`);

  await pageObjects.clickMicrophoneButton();

  await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

  await expect(
    pageObjects.runHook(
      'useSendBoxSpeechInterimsVisible',
      [],
      sendBoxSpeechInterimsVisible => sendBoxSpeechInterimsVisible[0]
    )
  ).resolves.toMatchInlineSnapshot(`true`);

  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  await expect(
    pageObjects.runHook(
      'useSendBoxSpeechInterimsVisible',
      [],
      sendBoxSpeechInterimsVisible => sendBoxSpeechInterimsVisible[0]
    )
  ).resolves.toMatchInlineSnapshot(`true`);
});

test('sendBoxSpeechInterimsVisible should return false when synthesizing', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaMicrophone('Hello, World!');
  await expect(pageObjects.startSpeechSynthesize());

  await expect(
    pageObjects.runHook(
      'useSendBoxSpeechInterimsVisible',
      [],
      sendBoxSpeechInterimsVisible => sendBoxSpeechInterimsVisible[0]
    )
  ).resolves.toMatchInlineSnapshot(`false`);

  await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

  await pageObjects.clickMicrophoneButton();

  await driver.wait(negationOf(speechSynthesisUtterancePended()), timeouts.ui);

  await expect(
    pageObjects.runHook(
      'useSendBoxSpeechInterimsVisible',
      [],
      sendBoxSpeechInterimsVisible => sendBoxSpeechInterimsVisible[0]
    )
  ).resolves.toMatchInlineSnapshot(`true`);
});

test('setter should be undefined', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setLanguage] = await pageObjects.runHook('useSendBoxSpeechInterimsVisible');

  expect(setLanguage).toBeUndefined();
});
