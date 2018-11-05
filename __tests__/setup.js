import { Builder, By, Key } from 'selenium-webdriver';

let driver;

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeEach(async () => {
  driver = await new Builder().forBrowser('chrome').build();

  await driver.get('http://localhost:3001/samples/full-bundle');
}, 10000);

afterEach(async () => {
  if (driver) {
    try {
      global.__coverage__ = await driver.executeScript(() => window.__coverage__);
    } finally {
      driver.quit();
    }
  }
});

test('setup', async () => {
  await sleep(2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('help', Key.RETURN);

  await sleep(2000);
}, 10000);
