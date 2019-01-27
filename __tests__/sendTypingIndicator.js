import { By, Key } from 'selenium-webdriver';

import botConnected from './setup/conditions/botConnected';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

test('Send typing indicator', async () => {
  const { driver } = await setupWebDriver({ props: { sendTypingIndicator: true } });

  await driver.wait(botConnected(), 2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('echo-typing', Key.RETURN);
  await driver.wait(minNumActivitiesShown(3), 2000);
  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  await driver.wait(minNumActivitiesShown(4), 5000);
}, 60000);

// TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
test('Send typing indicator using deprecated props', async () => {
  const { driver } = await setupWebDriver({ props: { sendTyping: true } });

  await driver.wait(botConnected(), 2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('echo-typing', Key.RETURN);
  await driver.wait(minNumActivitiesShown(3), 2000);
  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  await driver.wait(minNumActivitiesShown(4), 5000);
}, 60000);
