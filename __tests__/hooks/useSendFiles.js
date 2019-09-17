import { imageSnapshotOptions, timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling sendFile should send files', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useSendFiles', [], sendFiles =>
    sendFiles([
      {
        name: 'index.html',
        url: '/'
      },
      {
        name: 'index2.html',
        url: '/'
      }
    ])
  );

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
