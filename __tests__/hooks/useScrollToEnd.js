import { imageSnapshotOptions, timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import scrollToBottomButtonVisible from '../setup/conditions/scrollToBottomButtonVisible';
import scrollToBottomCompleted from '../setup/conditions/scrollToBottomCompleted';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling scrollToEnd should scroll to end', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('help');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.executeScript(() => {
    document.querySelector('[role="log"] > *').scrollTop = 0;
  });

  await driver.wait(scrollToBottomButtonVisible(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.runHook('useScrollToEnd', [], scrollToEnd => scrollToEnd());
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
