import { By, Key } from 'selenium-webdriver';

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('setup', async () => {
  const { driver } = await setupWebDriver();

  await sleep(2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await sleep(2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot();
}, 60000);
