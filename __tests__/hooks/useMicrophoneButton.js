import { timeouts } from '../constants.json';

import speechRecognitionStartCalled from '../setup/conditions/speechRecognitionStartCalled';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('microphoneButtonClick should toggle recording', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useMicrophoneButtonClick', [], microphoneButtonClick => microphoneButtonClick());

  await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

  await expect(
    pageObjects.runHook('useMicrophoneButtonDisabled', [], microphoneButtonDisabled => microphoneButtonDisabled[0])
  ).resolves.toBeTruthy();

  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  await expect(pageObjects.isDictating()).resolves.toBeTruthy();

  await pageObjects.runHook('useMicrophoneButtonClick', [], microphoneButtonClick => microphoneButtonClick());

  await expect(pageObjects.isDictating()).resolves.toBeFalsy();
});
