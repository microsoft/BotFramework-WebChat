import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('layout carousel');

  await driver.wait(minNumActivitiesShown(2), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with break-word', async () => {
  const { driver, pageObjects} = await setupWebDriver();

  await pageObjects.sendMessageViaSendBox('https://subdomain.domain.com/pathname0/pathname1/pathname2/pathname3/pathname4/')

  await driver.wait(minNumActivitiesShown(2), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with break-all', async () => {
  const WEB_CHAT_PROPS = { styleOptions: { messageActivityWordBreak: 'break-all' } };

  const { driver, pageObjects} = await setupWebDriver({ props: WEB_CHAT_PROPS });

  await pageObjects.sendMessageViaSendBox('https://subdomain.domain.com/pathname0/pathname1/pathname2/pathname3/pathname4/')

  await driver.wait(minNumActivitiesShown(2), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with keep-all', async () => {
  const WEB_CHAT_PROPS = { styleOptions: { messageActivityWordBreak: 'keep-all' } };

  const { driver, pageObjects} = await setupWebDriver({ props: WEB_CHAT_PROPS });

  await pageObjects.sendMessageViaSendBox('箸より重いものを持ったことがない箸より重いものを持ったことがない')

  await driver.wait(minNumActivitiesShown(2), 2000);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
