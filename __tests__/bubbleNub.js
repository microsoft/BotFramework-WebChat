import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
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

describe('bubble nub', () => {
  let props;

  beforeEach(() => {
    props = {
      styleOptions: {
        bubbleBorderColor: 'red',
        bubbleBorderRadius: 10,
        bubbleBorderWidth: 2,
        bubbleFromUserBorderColor: 'green',
        bubbleFromUserBorderRadius: 10,
        bubbleFromUserNubOffset: 0,
        bubbleFromUserNubSize: 10,
        bubbleFromUserBorderWidth: 2,
        bubbleNubOffset: 0,
        bubbleNubSize: 10
      }
    };
  });

  describe('at corner with offset', () => {
    test('of 5px should have corner radius of 5px', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          ...props,
          styleOptions: {
            ...props.styleOptions,
            bubbleFromUserNubOffset: 5,
            bubbleNubOffset: 5
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('of 10px should have corner radius of 10px', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          ...props,
          styleOptions: {
            ...props.styleOptions,
            bubbleFromUserNubOffset: 10,
            bubbleNubOffset: 10
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('of minus 5px should have corner radius of 5px and flipped nub', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          ...props,
          styleOptions: {
            ...props.styleOptions,
            bubbleFromUserNubOffset: -5,
            bubbleNubOffset: -5
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('of minus 10px should have corner radius of 10px and flipped nub', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          ...props,
          styleOptions: {
            ...props.styleOptions,
            bubbleFromUserNubOffset: -10,
            bubbleNubOffset: -10
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('at bottom should have flipped nub', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          ...props,
          styleOptions: {
            ...props.styleOptions,
            bubbleFromUserNubOffset: 'bottom',
            bubbleNubOffset: 'bottom'
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });
  });
});
