import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('layout carousel');

  await driver.wait(minNumActivitiesShown(3), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  // Hide cursor before taking screenshot
  await pageObjects.hideCursor();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, timeouts.test);
