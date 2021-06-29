import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import mediaBuffered from './setup/conditions/mediaBuffered.js';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

async function sendMessageAndMatchSnapshot(driver, pageObjects, message) {
  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox(message);

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}

describe('rtl UI', () => {
  let props;

  beforeEach(() => {
    props = {
      locale: 'ar-EG'
    };
  });

  test('should show "unable to connect" UI in Arabic when credentials are incorrect', async () => {
    const { driver } = await setupWebDriver({
      props: {
        ...props
      },
      createDirectLine: () => {
        return window.WebChat.createDirectLine({ token: 'INVALID-TOKEN' });
      },
      pingBotOnLoad: false,
      setup: () =>
        new Promise(resolve => {
          const scriptElement = document.createElement('script');

          scriptElement.onload = resolve;
          scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

          document.head.appendChild(scriptElement);
        })
    });

    await driver.wait(async driver => {
      return await driver.executeScript(
        () => !!~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_REJECTED')
      );
    }, timeouts.directLine);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('unknown command with nubs should display correctly', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        ...props,
        styleOptions: {
          bubbleNubOffset: 0,
          bubbleNubSize: 10,
          bubbleFromUserNubOffset: 0,
          bubbleFromUserNubSize: 10
        }
      }
    });

    await sendMessageAndMatchSnapshot(driver, pageObjects, 'صباح الخير');
  });

  // TODO: [P1] #3898 Un-skip this one after we bump to Chromium 85+.
  test.skip('carousel with avatar initials should display user and bot in reversed positions', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        ...props,
        styleOptions: {
          botAvatarInitials: 'WC',
          userAvatarInitials: 'WW'
        }
      }
    });

    await sendMessageAndMatchSnapshot(driver, pageObjects, 'arabic carousel');
  });

  // TODO: [P1] #3898 Un-skip this one after we bump to Chromium 85+.
  test.skip('carousel should scroll to the left instead of right', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        ...props
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('arabic carousel', { waitForSend: true });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const leftFlipper = await driver.findElement(By.css('button[aria-label="يسار"]'));

    await leftFlipper.click();
    await leftFlipper.click();
    await leftFlipper.click();

    // Wait for carousel animation to finish
    await driver.sleep(timeouts.ui);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with Adaptive Card should be displayed correctly', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        ...props
      }
    });

    await sendMessageAndMatchSnapshot(driver, pageObjects, 'card arabicgreeting');
  });

  test('with Audio Card should be displayed correctly', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        ...props
      }
    });

    await pageObjects.sendMessageViaSendBox('audiocard', { waitForSend: true });

    const audioElement = await driver.findElement(By.css('audio'));

    await driver.wait(mediaBuffered(audioElement));
    await pageObjects.playMediaToCompletion(audioElement);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should show suggested actions with images', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: { ...props }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('emptycard', { waitForSend: true });

    await driver.wait(suggestedActionsShown(), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetchImage);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
