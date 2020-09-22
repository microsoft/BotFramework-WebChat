import { timeouts } from '../__jest__/constants.json';

import minNumActivitiesShown from '../__jest__/conditions/minNumActivitiesShown';
import typingActivityReceived from '../__jest__/conditions/typingActivityReceived';
import uiConnected from '../__jest__/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling emitTypingIndicator should send a typing activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo-typing', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await pageObjects.runHook('useEmitTypingIndicator', [], fn => fn());

  await driver.wait(typingActivityReceived(), timeouts.directLine);
});
