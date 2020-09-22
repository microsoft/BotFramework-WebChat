import { timeouts } from '../__jest__/constants.json';

import speechRecognitionStartCalled from '../__jest__/conditions/speechRecognitionStartCalled';
import uiConnected from '../__jest__/conditions/uiConnected';

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
