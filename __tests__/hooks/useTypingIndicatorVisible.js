import { timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return true when typing indicator is shown', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const [typingIndicatorVisible] = await pageObjects.runHook('useTypingIndicatorVisible');

  expect(typingIndicatorVisible).toBeTruthy();
});

test('getter should return false when typing indicator is not shown', async () => {
  const { pageObjects } = await setupWebDriver();

  const [typingIndicatorVisible] = await pageObjects.runHook('useTypingIndicatorVisible');

  expect(typingIndicatorVisible).toBeFalsy();
});

test('getter should return false when user is typing', async () => {
  const { pageObjects } = await setupWebDriver({ props: { sendTypingIndicator: true } });

  await pageObjects.typeInSendBox('Hello, World!');

  const [typingIndicatorVisible] = await pageObjects.runHook('useTypingIndicatorVisible');

  expect(typingIndicatorVisible).toBeFalsy();
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setTypingIndicatorVisible] = await pageObjects.runHook('useTypingIndicatorVisible');

  expect(setTypingIndicatorVisible).toBeFalsy();
});
