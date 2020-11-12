import { imageSnapshotOptions, timeouts } from './constants.json';

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
});
