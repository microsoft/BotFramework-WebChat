import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import typingIndicator from './setup/assets/typingIndicator';
import staticSpinner from './setup/assets/staticSpinner';

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
  // await driver.wait(minNumActivitiesShown(3), 5000);
});

// TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
test('Send typing indicator using deprecated props', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { sendTyping: true } });

  await pageObjects.sendMessageViaSendBox('echo-typing', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys('ABC');

  // Typing indicator takes longer to come back
  // await driver.wait(minNumActivitiesShown(3), 5000);
});

test('typing indicator should display in SendBox', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { typingAnimationBackgroundImage: null },
      setup: () =>
        Promise.all([
          window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
          window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
        ]).then(() => {
          window.WebChatTest.clock = lolex.install();
        })
    }
  });

  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });

  await driver.executeScript(() => {
    window.WebChatTest.clock.tick(2500);
  });

  const base64PNG = await driver.takeScreenshot();
  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
