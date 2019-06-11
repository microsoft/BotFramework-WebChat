import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should focus send box when message is being sent', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createStyleSet: styleOptions => {
      const styleSet = window.WebChat.createStyleSet(styleOptions);

      return Object.assign({}, styleSet, {
        sendBox: Object.assign({}, styleSet.sendBox, {
          '& > .main > form > input:focus': {
            backgroundColor: 'Yellow'
          }
        })
      });
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('Hello, World!', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(1), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
