import { imageSnapshotOptions, timeouts } from '../constants.json';

import allOutgoingActivitiesSent from '../setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling sendFile should send files', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    // TODO: [P3] Offline bot did not reply with a downloadable attachment, we need to use production bot
    useProductionBot: true
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('useSendFiles', [], sendFiles => {
    const blob1 = new Blob([new ArrayBuffer(1024)]);
    const blob2 = new Blob([new ArrayBuffer(1024)]);

    blob1.name = 'index.png';
    blob2.name = 'index2.png';

    sendFiles([blob1, blob2]);
  });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
