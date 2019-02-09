import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import botConnected from './setup/conditions/botConnected';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

describe('stacked without avatar initials', () => {
  test('4 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout stacked');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout single');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ width: 640 });

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout single');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);
});

describe('stacked with avatar initials', () => {
  const WEB_CHAT_PROPS = { styleOptions: { botAvatarInitials: 'BF', userAvatarInitials: 'WC' } };

  test('4 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout stacked');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout single');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS, width: 640 });

    await pageObjects.pingBot();
    await pageObjects.sendMessageViaSendBox('layout single');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, timeouts.test);
});
