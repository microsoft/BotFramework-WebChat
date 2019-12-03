import { imageSnapshotOptions, timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from '../setup/conditions/scrollToBottomCompleted';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling submit should scroll to end', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeOnSendBox('help');

  await expect(pageObjects.runHook('useTextBoxValue', [], textBoxValue => textBoxValue[0])).resolves.toBe('help');

  await pageObjects.clickSendButton();

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.executeScript(() => {
    document.querySelector('[role="log"] > *').scrollTop = 0;
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.runHook('useTextBoxValue', [], textBoxValue => textBoxValue[1]('Hello, World!'));
  await pageObjects.runHook('useTextBoxSubmit', [], textBoxSubmit => textBoxSubmit());

  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
