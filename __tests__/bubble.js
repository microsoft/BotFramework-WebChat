import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('bubble with deprecated border style', () => {
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
