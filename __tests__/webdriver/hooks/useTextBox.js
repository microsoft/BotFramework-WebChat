import { imageSnapshotOptions, timeouts } from '../__jest__/constants.json';

import minNumActivitiesShown from '../__jest__/conditions/minNumActivitiesShown';
import negationOf from '../__jest__/conditions/negationOf';
import scrollToBottomButtonVisible from '../__jest__/conditions/scrollToBottomButtonVisible';
import scrollToBottomCompleted from '../__jest__/conditions/scrollToBottomCompleted';
import uiConnected from '../__jest__/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling submit should scroll to end', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox('help');

  await expect(pageObjects.runHook('useTextBoxValue', [], textBoxValue => textBoxValue[0])).resolves.toBe('help');

  await pageObjects.clickSendButton();

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await pageObjects.scrollToTop();

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.runHook('useTextBoxValue', [], textBoxValue => textBoxValue[1]('Hello, World!'));
  await pageObjects.runHook('useTextBoxSubmit', [], textBoxSubmit => textBoxSubmit());

  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.wait(negationOf(scrollToBottomButtonVisible()), timeouts.ui);
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
