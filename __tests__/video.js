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

  await driver.wait(allImagesLoaded(), timeouts.fetchImage);
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await pageObjects.switchToYouTubeIFRAME();

  // Play the video
  await clickButton(driver, By.css('button[aria-label="Play"]'));

  // Wait until the video complete buffered and start playing
  await driver.sleep(4000);

  // Pause the video
  await clickButton(driver, By.css('button[aria-label="Pause (k)"]'));

  // Jump back for 10 seconds, to get the buffering bar the same
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

    const loadProgress = document.querySelector('.ytp-load-progress');

    loadProgress && loadProgress.setAttribute('hidden', 'hidden');
  });

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
