// on blur:
// abc blur focus def undo, => abc de

import { Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import getSendBoxTextBox from '../elements/getSendBoxTextBox';
import getTranscript from './setup/elements/getTranscript.js';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('Emoji will be reverted to emoticon in reverse order after Ctrl Z is pressed', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: true }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox(':) <3');

  const base64PNG = await driver.takeScreenshot();

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Undo will revert typed emoticons/emoji in reverse order', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: true }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.typeInSendBox(':)<3');

  // should be 😊❤️
  const base64PNG = await driver.takeScreenshot();
  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  // should be 😊<3
  const base64PNG = await driver.takeScreenshot();

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  // only 😊 should show
  const base64PNG = await driver.takeScreenshot();

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  // should be :)
  const base64PNG = await driver.takeScreenshot();

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();
  // should be empty sendbox
  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Typing CTRL + Z in an empty sendbox will have no effect on sendbox', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  const transcript = await getTranscript(driver);

  await transcript.click();

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.typeInSendBox('So long and thanks for all the fish');

  const base64PNG2 = await driver.takeScreenshot();

  expect(base64PNG2).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Typing CTRL + Z in a sendbox will remove one letter from sendbox string', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  const transcript = await getTranscript(driver);

  await transcript.click();

  await pageObjects.typeInSendBox('So long and thanks for all the fish');

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();

  const base64PNG2 = await driver.takeScreenshot();

  expect(base64PNG2).toMatchImageSnapshot(imageSnapshotOptions);
});

test('AFTER BLUR Typing CTRL + Z in a sendbox will remove one letter from sendbox string', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  const transcript = await getTranscript(driver);

  await transcript.click();

  await pageObjects.typeInSendBox('So long and thanks for all the fish');

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.actions().keyDown(Key.CONTROL).sendKeys('z').keyUp(Key.CONTROL).perform();

  const base64PNG2 = await driver.takeScreenshot();

  expect(base64PNG2).toMatchImageSnapshot(imageSnapshotOptions);

  const sendBoxTextBox = await getSendBoxTextBox();

  const selectionStart = await driver.executeScript(sendBoxTextBox => sendBoxTextBox.selectionStart, sendBoxTextBox);

  expect(selectionStart).toBe(99);
});

// testing selectionStart
