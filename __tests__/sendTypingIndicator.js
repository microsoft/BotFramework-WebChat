import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negationOf from './setup/conditions/negationOf';
import typingActivityReceived from './setup/conditions/typingActivityReceived';
import typingAnimationBackgroundImage from './setup/assets/typingIndicator';
import typingIndicatorShown from './setup/conditions/typingIndicatorShown';
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
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();
  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('changing typing indicator duration on-the-fly', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { typingAnimationBackgroundImage, typingAnimationDuration: 1000 }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(typingIndicatorShown(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.wait(negationOf(typingIndicatorShown()), 2000);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({
    styleOptions: { typingAnimationBackgroundImage, typingAnimationDuration: 5000 }
  });

  await driver.wait(typingIndicatorShown(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should not show typing indicator for user', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { sendTypingIndicator: true } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.typeInSendBox('Hello, World!');
  await driver.wait(negationOf(typingIndicatorShown()), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
