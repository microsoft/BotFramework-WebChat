import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown.js';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('hero card', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('herocard', { waitForSend: true });

  await driver.wait(allImagesLoaded(), timeouts.fetchImage);
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  // Wait for transcript to scroll to bottom
  await driver.sleep(1000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('null renderMarkdown function', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { renderMarkdown: null } });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('echo **This text should be plain text**', { waitForSend: true });

  await driver.wait(allImagesLoaded(), timeouts.fetchImage);
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
