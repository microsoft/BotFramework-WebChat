import { By, Key } from 'selenium-webdriver';
import { imageSnapshotOptions } from './constants.json';

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('setup', async () => {
  const { driver } = await setupWebDriver();

  await sleep(2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await sleep(2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}, 60000);
