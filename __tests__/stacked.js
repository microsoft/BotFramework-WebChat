import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('stacked without avatar initials', () => {
  test('4 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout stacked', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});

describe('stacked with avatar initials', () => {
  const WEB_CHAT_PROPS = { styleOptions: { botAvatarInitials: 'BF', userAvatarInitials: 'WC' } };

  test('4 attachments', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout stacked', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('1 attachment with wide screen', async () => {
    const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS, width: 640 });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('layout single', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
