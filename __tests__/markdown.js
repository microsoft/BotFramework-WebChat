import { imageSnapshotOptions, timeouts } from './constants.json';

import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown.js';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('hero card', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('herocard', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
