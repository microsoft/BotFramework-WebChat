import { Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import getTranscript from './setup/elements/getTranscript.js';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('Copy/pasted text with incidental emoticons will (undesirably) replace emoticons with emoji', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: { '):': '☹️' } }
    }
  });

  // create input text and copy to clipboard
  await pageObjects.sendTextToClipboard('function enabled(): boolean { return true; }');

  await driver.wait(uiConnected(), timeouts.directLine);

  const transcript = await getTranscript(driver);

  await transcript.click();

  await driver
    .actions()
    .keyDown(Key.CONTROL)
    .sendKeys('v')
    .keyUp(Key.CONTROL)
    .perform();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Copy/pasted text with escaped emoticons will replace to fully escaped emoticon', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: { '):': '☹️' } }
    }
  });

  // create input text and copy to clipboard
  await pageObjects.sendTextToClipboard('function enabled(\\): boolean { return true; }');

  await driver.wait(uiConnected(), timeouts.directLine);

  const transcript = await getTranscript(driver);

  await transcript.click();

  await driver
    .actions()
    .keyDown(Key.CONTROL)
    .sendKeys('v')
    .keyUp(Key.CONTROL)
    .perform();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Typed text with escaped emoticons will replace to fully escaped emoticon', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: { '):': '☹️' } }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox('function enabled(\\): boolean { return true; }');

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
