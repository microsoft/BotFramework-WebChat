import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import botConnected from './setup/conditions/botConnected';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

describe('carousel without avatar initials', () => {
  test('4 attachments and no message', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('4 attachments and message', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('2 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout double', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('2 attachments with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ width: 640 });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout double', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout single carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ width: 640 });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout single carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);
});

describe('carousel with avatar initials', () => {
  const WEB_CHAT_PROPS = { styleOptions: { botAvatarInitials: 'BF', userAvatarInitials: 'WC' } };

  test('4 attachments and no message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('4 attachments and message', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    const rightFlipper = await driver.findElement(By.css('button[aria-label="Right"]'));

    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();
    await rightFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(1000);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('2 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout double', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('2 attachments with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS, width: 640 });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout double', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout single carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS, width: 640 });

    await driver.wait(botConnected(), timeouts.directLine);

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('layout single carousel', Key.RETURN);
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    // Hide cursor before taking screenshot
    await pageObjects.hideCursor();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  }, 60000);
});
