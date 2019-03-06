import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('layout carousel');

  await driver.wait(minNumActivitiesShown(2), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
