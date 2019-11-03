import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

import createAdaptiveCardsHostConfig from '../packages/bundle/src/adaptiveCards/Styles/adaptiveCardHostConfig';
import defaultStyleOptions from '../packages/component/src/Styles/defaultStyleOptions';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('breakfast card', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card breakfast', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('breakfast card with custom host config', async () => {
  const adaptiveCardHostConfig = createAdaptiveCardsHostConfig({ ...defaultStyleOptions, bubbleTextColor: '#FF0000' });

  const { driver, pageObjects } = await setupWebDriver({
    props: {
      adaptiveCardHostConfig
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card breakfast', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('breakfast card with custom style options', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        bubbleTextColor: '#FF0000'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card breakfast', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('disable card inputs', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.executeScript(() => {
    document.querySelector('.ac-adaptiveCard input[type="checkbox"]').checked = true;
    document.querySelector('.ac-adaptiveCard input[type="date"]').value = '2019-11-01';
    document.querySelector('.ac-adaptiveCard input[type="radio"]').checked = true;
    document.querySelector('.ac-adaptiveCard input[type="text"]').value = 'William';
    document.querySelector('.ac-adaptiveCard input[type="time"]').value = '12:34';
    document.querySelector('.ac-adaptiveCard select').value = '1';
    document.querySelector('.ac-adaptiveCard textarea').value = 'One Redmond Way, Redmond, WA';
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ disabled: true });

  // Click "Submit" button should have no effect
  await driver.executeScript(() => {
    document.querySelector('.ac-actionSet button:nth-of-type(2)').click();
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ disabled: false });

  // Click "Submit" button should send values to the bot
  await driver.executeScript(() => {
    document.querySelector('.ac-actionSet button:nth-of-type(2)').click();
  });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
