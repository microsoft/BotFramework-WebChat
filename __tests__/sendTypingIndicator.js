import { By } from 'selenium-webdriver';

import { timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('Send typing indicator', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { sendTypingIndicator: true } });

  await pageObjects.sendMessageViaSendBox('echo-typing', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  await driver.wait(minNumActivitiesShown(3), 5000);
});

// TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
test('Send typing indicator using deprecated props', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { sendTyping: true } });

  await pageObjects.sendMessageViaSendBox('echo-typing', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  await driver.wait(minNumActivitiesShown(3), 5000);
});
