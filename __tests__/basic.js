import { By, Key } from 'selenium-webdriver';
import { imageSnapshotOptions } from './constants.json';

import directLineConnected from './conditions/directLineConnected';
import hasNumActivities from './conditions/hasNumActivities';
import webChatLoaded from './conditions/webChatLoaded';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('setup', async () => {
  const { driver } = await setupWebDriver();

  await driver.wait(webChatLoaded(), 2000);
  await driver.wait(directLineConnected(), 2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await driver.wait(hasNumActivities(2), 2000);

  // TODO: [P2] Remove this sleep which wait for the image to be loaded
  await driver.sleep(1000);

  // Hide cursor before taking screenshot
  await driver.executeScript(() => document.querySelector(':focus').blur());

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, 60000);
