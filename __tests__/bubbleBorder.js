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

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
}

describe('bubble border', () => {
  test('with color, radius, style, and width set', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          bubbleBorderColor: 'Red',
          bubbleBorderRadius: 10,
          bubbleBorderStyle: 'dashed',
          bubbleBorderWidth: 2,

          bubbleFromUserBorderColor: 'Green',
          bubbleFromUserBorderRadius: 20,
          bubbleFromUserBorderStyle: 'dotted',
          bubbleFromUserBorderWidth: 3
        }
      },
      zoom: 3
    });

    await sendMessageAndMatchSnapshot(driver, pageObjects, 'echo Hello, World!');
  });

  describe('with deprecated border style', () => {
    test('with color, radius, style, and width set', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            bubbleBorder: 'dashed 2px Red',
            bubbleBorderRadius: 10,

            bubbleFromUserBorder: 'dotted 3px Green',
            bubbleFromUserBorderRadius: 20
          }
        },
        zoom: 3
      });

      await sendMessageAndMatchSnapshot(driver, pageObjects, 'echo Hello, World!');
    });

    test('of "dashed 2px Red" and "dotted 2px Green"', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            bubbleBorder: 'dashed 2px Red',
            bubbleFromUserBorder: 'dotted 2px Green'
          }
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('Hello, World!');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('of "dashed" and "dotted"', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            bubbleBorder: 'dashed',
            bubbleFromUserBorder: 'dotted'
          }
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('Hello, World!');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('of "2px"', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            bubbleBorder: '2px',
            bubbleFromUserBorder: '2px'
          }
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('Hello, World!');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('of "Red" and "Green"', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          styleOptions: {
            bubbleBorder: 'Red',
            bubbleFromUserBorder: 'Green'
          }
        }
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('Hello, World!');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
    });
  });
});
