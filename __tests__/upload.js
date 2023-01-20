/* eslint no-magic-numbers: "off" */
/* eslint no-undef: "off" */

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('upload a picture', () => {
  test('', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, fatal, name, type, value } = event;

          (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
            data,
            dimensions,
            duration,
            error,
            fatal,
            name,
            type,
            value
          });
        }
      },
      // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendFile('seaofthieves.jpg');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const telemetryMeasurements = await driver.executeScript(() => window.WebChatTest.telemetryMeasurements);

    expect(telemetryMeasurements).toHaveProperty('length', 4);
    expect(telemetryMeasurements[2]).toHaveProperty('name', 'sendFiles:makeThumbnail');
    expect(telemetryMeasurements[2]).toHaveProperty('type', 'timingend');

    telemetryMeasurements[2].duration = 1000;

    expect(telemetryMeasurements).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "fatal": null,
          "name": "init",
          "type": "event",
          "value": null,
        },
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "fatal": null,
          "name": "sendFiles:makeThumbnail",
          "type": "timingstart",
          "value": null,
        },
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": 1000,
          "error": null,
          "fatal": null,
          "name": "sendFiles:makeThumbnail",
          "type": "timingend",
          "value": null,
        },
        Object {
          "data": Object {
            "numFiles": 1,
            "sumSizeInKB": 379,
          },
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "fatal": null,
          "name": "sendFiles",
          "type": "event",
          "value": null,
        },
      ]
    `);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with custom thumbnail size', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          uploadThumbnailContentType: 'image/png',
          uploadThumbnailHeight: 60,
          uploadThumbnailWidth: 120
        }
      },
      // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendFile('seaofthieves.jpg');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with custom thumbnail quality', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          uploadThumbnailQuality: 0.1
        }
      },
      // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendFile('seaofthieves.jpg');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with custom thumbnail disabled', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          enableUploadThumbnail: false
        }
      },
      // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await pageObjects.sendFile('seaofthieves.jpg');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  describe('without Web Worker', () => {
    test('', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
        useProductionBot: true
      });

      await driver.executeScript(() => {
        window.Worker = undefined;
      });
      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendFile('seaofthieves.jpg');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await driver.wait(allImagesLoaded(), timeouts.fetchImage);

      const base64PNG = await driver.takeScreenshot();

      expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('with custom thumbnail size', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            uploadThumbnailContentType: 'image/png',
            uploadThumbnailHeight: 60,
            uploadThumbnailWidth: 120
          }
        },
        // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
        useProductionBot: true
      });

      await driver.executeScript(() => {
        window.Worker = undefined;
      });
      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendFile('seaofthieves.jpg');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await driver.wait(allImagesLoaded(), timeouts.fetchImage);

      const base64PNG = await driver.takeScreenshot();

      expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('with custom thumbnail quality', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            uploadThumbnailQuality: 0.1
          }
        },
        // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
        useProductionBot: true
      });

      await driver.executeScript(() => {
        window.Worker = undefined;
      });
      await driver.wait(uiConnected(), timeouts.directLine);

      await pageObjects.sendFile('seaofthieves.jpg');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await driver.wait(allImagesLoaded(), timeouts.fetchImage);

      const base64PNG = await driver.takeScreenshot();

      expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    });
  });
});

test('upload a ZIP file', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
    useProductionBot: true
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('empty.zip');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('upload a .txt (plain) file', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    // TODO: [P3] Offline bot did not reply with a downloadable attachment, so we need to use production bot
    useProductionBot: true
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('empty.txt');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
