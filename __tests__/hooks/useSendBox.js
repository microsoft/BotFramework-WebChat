import { timeouts } from '../constants.json';

import speechRecognitionStartCalled from '../setup/conditions/speechRecognitionStartCalled';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('sendBoxDictationStarted should return if dictation is started or not', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await expect(
    pageObjects.runHook('useSendBoxDictationStarted', [], sendBoxDictationStarted => sendBoxDictationStarted[0])
  ).resolves.toMatchInlineSnapshot(`false`);

  await pageObjects.clickMicrophoneButton();

  await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

  await expect(
    pageObjects.runHook('useSendBoxDictationStarted', [], sendBoxDictationStarted => sendBoxDictationStarted[0])
  ).resolves.toMatchInlineSnapshot(`true`);

  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  await expect(
    pageObjects.runHook('useSendBoxDictationStarted', [], sendBoxDictationStarted => sendBoxDictationStarted[0])
  ).resolves.toMatchInlineSnapshot(`true`);
});

test('sendBoxDictationStarted should return false when synthesizing', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaMicrophone('Hello, World!');
  await expect(pageObjects.startSpeechSynthesize());
  await pageObjects.clickMicrophoneButton();

  await expect(
    pageObjects.runHook('useSendBoxDictationStarted', [], sendBoxDictationStarted => sendBoxDictationStarted[0])
  ).resolves.toMatchInlineSnapshot(`false`);

  await pageObjects.endSpeechSynthesize();

  await expect(
    pageObjects.runHook('useSendBoxDictationStarted', [], sendBoxDictationStarted => sendBoxDictationStarted[0])
  ).resolves.toMatchInlineSnapshot(`true`);
});
