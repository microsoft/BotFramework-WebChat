import { timeouts } from '../constants.json';

import isDictating from '../setup/pageObjects/isDictating';
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

  await expect(pageObjects.isDictating()).resolves.toBeFalsy();
});
