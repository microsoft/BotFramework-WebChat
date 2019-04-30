import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

let props;

beforeEach(() => {
  props = {
    // We are using red/green border to emphasis the size of the border while testing
    styleOptions: {
      bubbleBorderColor: 'red',
      bubbleFromUserBorderColor: 'green'
    }
  };
});

describe('carousel without avatar initials', () => {
  test('4 attachments and no message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('4 attachments and message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('2 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout double', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('2 attachments with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props, width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout double', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props, width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});

describe('carousel with avatar initials', () => {
  beforeEach(() => {
    props = {
      ...props,
      styleOptions: {
        ...props.styleOptions,
        botAvatarInitials: 'BF',
        userAvatarInitials: 'WC'
      }
    };
  });

  test('4 attachments and no message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('4 attachments and message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('2 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout double', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('2 attachments with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props, width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout double', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props, width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
