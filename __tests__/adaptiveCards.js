/** @jest-environment jsdom */

import { logging } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

import createAdaptiveCardsHostConfig from '../packages/bundle/src/adaptiveCards/Styles/adaptiveCardHostConfig';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('breakfast card', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card breakfast', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('container styles', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card containerstyles', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('action styles', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card actionstyles', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('breakfast card with custom host config', async () => {
  const adaptiveCardHostConfig = createAdaptiveCardsHostConfig({ bubbleTextColor: '#FF0000' });

  const { driver, pageObjects } = await setupWebDriver({
    props: {
      adaptiveCardHostConfig
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card breakfast', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

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
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('disable card inputs', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.executeScript(() => {
    document.querySelector('.ac-adaptiveCard input[type="checkbox"]').checked = true;
    document.querySelector('.ac-adaptiveCard input[type="date"]').value = '2019-11-01';
    document.querySelector('.ac-adaptiveCard input[type="radio"]').checked = true;
    document.querySelector('.ac-adaptiveCard input[type="text"]').value = 'William';
    document.querySelector('.ac-adaptiveCard input[type="time"]').value = '12:34';
    document.querySelector('.ac-adaptiveCard input[type="number"]').value = '1';
    document.querySelector('.ac-adaptiveCard select').value = '1';
    document.querySelector('.ac-adaptiveCard textarea').value = 'One Redmond Way, Redmond, WA';
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ disabled: true });
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  // Click "Submit" button should have no effect
  await driver.executeScript(() => {
    document.querySelector('.ac-actionSet button:nth-of-type(2)').click();
  });

  //@todo change to use scrollStabilizer after release
  await new Promise(resolve => setTimeout(resolve, 1000));

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ disabled: false });

  // Wait until render after update props
  await driver.wait(
    () =>
      driver.executeScript(() => {
        const button = document.querySelector('.ac-actionSet button:nth-of-type(2)');

        return button && !button.disabled;
      }),
    timeouts.ui
  );

  // Click "Submit" button should send values to the bot
  await driver.executeScript(() => {
    document.querySelector('.ac-actionSet button:nth-of-type(2)').click();
  });

  //@todo change to use scrollStabilizer after release
  await new Promise(resolve => setTimeout(resolve, 1000));

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('broken card of invalid version', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card broken', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('unknown card', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card unknown', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const browserConsoleErrors = await driver.manage().logs().get(logging.Type.BROWSER);

  expect(browserConsoleErrors[0].level.name_).toEqual('WARNING');
  expect(browserConsoleErrors[0].message).toContain('No renderer for attachment for screen reader of type');
});

test('Inputs card with custom style options and submit action', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        cardPushButtonBackgroundColor: '#ee0606',
        cardPushButtonTextColor: '#ee0606'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  // To submit the input form, the number field is mandatory.
  await driver.executeScript(() => {
    document.querySelector('.ac-adaptiveCard input[type="number"]').value = '1';
  });

  // Click "Submit" button should change the button color
  await driver.executeScript(() => {
    document.querySelector('.ac-actionSet button:nth-of-type(2)').click();
  });

  //@todo change to use scrollStabilizer after release
  await new Promise(resolve => setTimeout(resolve, 1000));

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('Textblock styles', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('card textstyle', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
