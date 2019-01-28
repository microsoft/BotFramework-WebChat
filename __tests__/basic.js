import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded.js';
import directLineConnected from './setup/conditions/directLineConnected';
import minNumActivitiesReached from './setup/conditions/minNumActivitiesReached';
import webChatLoaded from './setup/conditions/webChatLoaded';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(webChatLoaded(), timeouts.navigation);
  await driver.wait(directLineConnected(), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await driver.wait(minNumActivitiesReached(3), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetch);

  // Hide cursor before taking screenshot
  await pageObjects.hideCursor();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, 60000);
