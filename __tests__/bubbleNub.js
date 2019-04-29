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
  await driver.wait(allImagesLoaded(), timeouts.fetch);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}

describe('bubble nub', () => {
  let props;

  test('with standard setup', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          bubbleNubOffset: 0,
          bubbleNubSize: 10,
          bubbleFromUserNubOffset: 0,
          bubbleFromUserNubSize: 10
        }
      },
      zoom: 3
    });

    await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout carousel');
  });

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

  describe('with avatar initials', () => {
    beforeEach(() => {
      props = {
        ...props,
        styleOptions: {
          ...props.styleOptions,
          botAvatarInitials: 'WC',
          userAvatarInitials: 'WW'
        }
      };
    });

    test('and carousel with a message should have nub on message only', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout carousel');
    });

    test('and carousel without a message should not have nubs', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'carousel');
    });

    test('and stacked without a message should not have nubs', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout single');
    });

    test('and a single message should have nub', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('and carousel with a single attachment should have nub on message only', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout single carousel');
    });
  });

  describe('without avatar initials', () => {
    test('and carousel with a message should have nub on message only and indented', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout carousel');
    });

    test('and carousel without a message should not have nubs and indented', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'carousel');
    });

    test('and stacked without a message should not have nubs and indented', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout single');
    });

    test('and a single message should have nub and indented', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'Hello, World!');
    });

    test('and carousel with a single attachment should have nub on message only', async () => {
      const { driver, pageObjects } = await setupWebDriver({ props, zoom: 3 });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'layout single carousel');
    });
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
