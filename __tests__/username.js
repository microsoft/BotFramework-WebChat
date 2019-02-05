import { By, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import botConnected from './setup/conditions/botConnected';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('send username in activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(botConnected(), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('user name', Key.RETURN);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  // Hide cursor before taking screenshot
  await pageObjects.hideCursor();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, 60000);
