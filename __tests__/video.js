import { By, until } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown.js';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

async function clickButton(driver, locator) {
  await driver.wait(until.elementLocated(locator), timeouts.ui);

  const pauseButton = await driver.findElement(locator);

  await pauseButton.click();
}

test('video', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('video youtube', { waitForSend: true });

  await driver.wait(allImagesLoaded(), timeouts.fetch);
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await pageObjects.switchToYouTubeIFRAME();

  await clickButton(driver, By.css('button[aria-label="Play"]'));
  await clickButton(driver, By.css('button[aria-label="Pause (k)"]'));

  // Hide the spinner animation
  await driver.executeScript(() => document.querySelector('.ytp-spinner').remove());

  // Wait for YouTube play/pause button animation to complete
  await driver.sleep(1000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
