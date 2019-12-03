import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling startDictate should start dictate', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.runHook('useStartDictate', [], startDictate => startDictate());

  // The engine is starting, but not fully started yet.
  await expect(pageObjects.isDictating()).resolves.toBeFalsy();

  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello, World!');

  // The engine has started, and recognition is ongoing and is not stopping.
  await expect(pageObjects.isDictating()).resolves.toBeTruthy();
});
