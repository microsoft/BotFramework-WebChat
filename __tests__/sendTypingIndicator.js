import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import typingActivityReceived from './setup/conditions/typingActivityReceived';
import typingAnimationBackgroundImage from './setup/assets/typingIndicator';
import uiConnected from './setup/conditions/uiConnected';

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
  await driver.wait(typingActivityReceived(), timeouts.directLine);
});

// TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
test('Send typing indicator using deprecated props', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { sendTyping: true }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('echo-typing', { waitForSend: true });

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  await driver.wait(typingActivityReceived(), timeouts.directLine);
});

test('typing indicator should display in SendBox', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions: { typingAnimationBackgroundImage } } });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });

  // Typing indicator takes longer to come back
  await driver.wait(typingActivityReceived(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('typing indicator should not display after second activity', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { typingAnimationBackgroundImage, typingAnimationDuration: 10000 }
    }
  });

  await pageObjects.sendMessageViaSendBox('typing', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), 5000);

  const base64PNG = await driver.takeScreenshot();
  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
