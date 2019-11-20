import { timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get last typing at', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const now = Date.now();
  const [lastTypingAt] = await pageObjects.runHook('useLastTypingAt');

  expect(Math.abs(lastTypingAt.bot - now)).toBeLessThanOrEqual(timeouts.directLine);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setLastTypingAt] = await pageObjects.runHook('useLastTypingAt');

  expect(setLastTypingAt).toBeFalsy();
});
