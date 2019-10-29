import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('style options', () => {
  test('bubble background and color', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          bubbleBackground: '#900',
          bubbleBorderColor: 'rgba(0, 0, 0, .5)',
          bubbleBorderWidth: 2,
          bubbleFromUserBackground: '#090',
          bubbleFromUserBorderColor: 'rgba(0, 0, 0, .5)',
          bubbleFromUserBorderWidth: 2,
          bubbleFromUserNubSize: 10,
          bubbleFromUserTextColor: 'rgba(255, 255, 255, .5)',
          bubbleNubSize: 10,
          bubbleTextColor: 'rgba(255, 255, 255, .5)'
        }
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('echo This will set bubble background and text color.', {
      waitForSend: true
    });

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('hide scroll to bottom button', async () => {
    const { driver, pageObjects } = await setupWebDriver();

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('markdown', { waitForSend: true });
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.ui);

    await pageObjects.scrollToTop();

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

    await pageObjects.updateProps({ styleOptions: { hideScrollToEndButton: true } });

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
