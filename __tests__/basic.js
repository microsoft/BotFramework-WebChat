import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import botConnected from './setup/conditions/botConnected';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(botConnected(), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await driver.wait(minNumActivitiesShown(3), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  // Hide cursor before taking screenshot
  await pageObjects.hideCursor();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, 60000);
