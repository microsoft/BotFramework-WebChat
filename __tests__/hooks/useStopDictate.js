import { timeouts } from '../constants.json';

import isDictating from '../setup/pageObjects/isDictating';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling stopDictate should stop dictate', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.clickMicrophoneButton();
  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  await driver.wait(driver => isDictating(driver), timeouts.ui);

  await expect(pageObjects.isDictating()).resolves.toBeTruthy();

  await pageObjects.runHook('useStopDictate', [], stopDictate => stopDictate());

  await expect(pageObjects.isDictating()).resolves.toBeFalsy();
});
