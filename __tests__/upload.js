import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('upload a picture', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('seaofthieves.jpg');
  await driver.wait(minNumActivitiesShown(2));
  await driver.wait(allImagesLoaded());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('upload a picture with custom thumbnail size', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        uploadThumbnailContentType: 'image/png',
        uploadThumbnailHeight: 60,
        uploadThumbnailWidth: 120
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

test('upload a picture with custom thumbnail quality', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        uploadThumbnailQuality: 0.1
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

test('upload a picture with custom thumbnail disabled', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        enableUploadThumbnail: false
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

test('upload a text file', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('hello.txt');
  await driver.wait(minNumActivitiesShown(2));
  await driver.wait(allImagesLoaded());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
