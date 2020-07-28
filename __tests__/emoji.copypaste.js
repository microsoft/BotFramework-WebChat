import { Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import getTranscript from './setup/elements/getTranscript.js';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('Correct emoticon should be converted to emoji when copy pasted from clipboard', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { emojiSet: true }
    }
  });

  // create input text and copy to clipboard
  await pageObjects.sendTextToClipboard(':) <3');

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
