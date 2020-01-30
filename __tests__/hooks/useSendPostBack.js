import { imageSnapshotOptions, timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling sendPostBack should send a post back activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useSendPostBack', [], sendPostBack => sendPostBack({ hello: 'World!' }));

  await driver.wait(minNumActivitiesShown(1), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
