import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should show correctly formatted buttons when suggested actions are displayed', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show correctly formatted buttons when suggested actions are displayed as stacked', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { styleOptions: { suggestedActionLayout: 'stacked' } }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show response from bot and no text from user on imback', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  const buttons = await driver.findElements(By.css('.webchat__suggested-actions button'));

  const imBackButton = buttons[1];

  await imBackButton.click();
  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show response from bot and no text from user on postback', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  const buttons = await driver.findElements(By.css('.webchat__suggested-actions button'));

  const postBackStringButton = buttons[2];

  await postBackStringButton.click();
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show response from bot and text from user on postback', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  const buttons = await driver.findElements(By.css('.webchat__suggested-actions button'));

  const postBackStringButton = buttons[3];

  await postBackStringButton.click();
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show response from bot and no text from user on messageback', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  const buttons = await driver.findElements(By.css('.webchat__suggested-actions button'));

  const postBackStringButton = buttons[4];

  await postBackStringButton.click();
  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show response from bot and text from user on messageback', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  const buttons = await driver.findElements(By.css('.webchat__suggested-actions button'));

  const postBackStringButton = buttons[4];

  await postBackStringButton.click();
  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should not show suggested actions not destined for the user', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions others', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show suggested actions with images', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('emptycard', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show suggested actions with larger images', async () => {
  const styleOptions = { suggestedActionHeight: 80, suggestedActionImageHeight: 60 };
  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('emptycard', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show suggested actions with larger images as stacked', async () => {
  const styleOptions = {
    suggestedActionHeight: 80,
    suggestedActionImageHeight: 60,
    suggestedActionLayout: 'stacked'
  };
  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('emptycard', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with height of 50', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { styleOptions: { suggestedActionLayout: 'stacked', suggestedActionsStackedHeight: 50 } }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with a max height of 50 with overflow hidden', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 50,
        suggestedActionsStackedOverflow: 'hidden'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with a max height of 50 with overflow scroll', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 50,
        suggestedActionsStackedOverflow: 'scroll'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with height of 50 and scroll overflow if overflow is unassigned', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 50,
        suggestedActionsStackedOverflow: 'scroll'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with auto height if suggested actions do not need the assigned max height', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 1000
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions with max-height ignored if it is set to 0', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 0
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should show stacked suggested actions, ignoring max-height: 0 and overflow: hidden', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        suggestedActionLayout: 'stacked',
        suggestedActionsStackedHeight: 0,
        suggestedActionsStackedOverflow: 'hidden'
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });

  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
