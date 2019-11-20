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

  // Play the video
  await clickButton(driver, By.css('button[aria-label="Play"]'));

  // Wait until the video complete buffered and start playing
  await driver.sleep(5000);

  // Pause the video
  await clickButton(driver, By.css('button[aria-label="Pause (k)"]'));

  // Rewind for 10 seconds
  await driver
    .actions()
    .sendKeys('j')
    .perform();

  // Wait for YouTube play/pause/rewind animation to complete
  await driver.sleep(1000);

  // Hide the spinner animation
  await driver.executeScript(() => {
    const spinner = document.querySelector('.ytp-spinner');

    spinner && spinner.remove();
  });

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
