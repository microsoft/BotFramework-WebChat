import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('upload a file', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('seaofthieves.jpg');
  await driver.wait(minNumActivitiesShown(2));
  await driver.wait(allImagesLoaded());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('upload a file with custom thumbnail size', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        thumbnailContentType: 'image/png',
        thumbnailHeight: 60,
        thumbnailWidth: 120
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('seaofthieves.jpg');
  await driver.wait(minNumActivitiesShown(2));
  await driver.wait(allImagesLoaded());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('upload a file with custom thumbnail quality', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        thumbnailQuality: 0.1
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('seaofthieves.jpg');
  await driver.wait(minNumActivitiesShown(2));
  await driver.wait(allImagesLoaded());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
