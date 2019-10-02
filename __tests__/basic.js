import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('setup', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('layout carousel', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with break-word', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox(
    'https://subdomain.domain.com/pathname0/pathname1/pathname2/pathname3/pathname4/',
    { waitForSend: true }
  );

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with break-all', async () => {
  const WEB_CHAT_PROPS = { styleOptions: { messageActivityWordBreak: 'break-all' } };

  const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox(
    'https://subdomain.domain.com/pathname0/pathname1/pathname2/pathname3/pathname4/',
    { waitForSend: true }
  );

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('long URLs with keep-all', async () => {
  const WEB_CHAT_PROPS = { styleOptions: { messageActivityWordBreak: 'keep-all' } };

  const { driver, pageObjects } = await setupWebDriver({ props: WEB_CHAT_PROPS });

  await pageObjects.sendMessageViaSendBox('箸より重いものを持ったことがない箸より重いものを持ったことがない', {
    waitForSend: true
  });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('unknown activities do not render anything in the transcript', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('unknown activity', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(1), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('hero card with a long title and richCardWrapTitle set to true', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions: { richCardWrapTitle: true } } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('herocard long title', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('hero card with a long title and richCardWrapTitle set to default value', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('herocard long title', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('thumbnail card with a long title and richCardWrapTitle set to true', async () => {
  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions: { richCardWrapTitle: true } } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('thumbnailcard long title', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('thumbnail card with a long title and richCardWrapTitle set to default value', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('thumbnailcard long title', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), 2000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('absolute timestamp', async () => {
  const activities = [
    {
      type: 'message',
      id: '6266x5ZXhXkBfuIH0fNx0h-o|0000000',
      timestamp: '2019-08-08T16:41:12.9397263Z',
      from: {
        id: 'dl_654b35e09ab4149595a70aa6f1af6f50',
        name: '',
        role: 'user'
      },
      textFormat: 'plain',
      text: 'echo "Hello, World!"'
    },
    {
      type: 'message',
      id: '6266x5ZXhXkBfuIH0fNx0h-o|0000001',
      timestamp: '2019-08-08T16:41:13.1835518Z',
      from: {
        id: 'webchat-mockbot',
        name: 'webchat-mockbot',
        role: 'bot'
      },
      text: 'Echoing back in a separate activity.'
    },
    {
      type: 'message',
      id: '6266x5ZXhXkBfuIH0fNx0h-o|0000002',
      timestamp: '2019-08-08T16:41:13.3963019Z',
      from: {
        id: 'webchat-mockbot',
        name: 'webchat-mockbot',
        role: 'bot'
      },
      text: 'Hello, World!'
    }
  ];
  const styleOptions = { timestampFormat: 'absolute' };
  const { driver } = await setupWebDriver({ storeInitialState: { activities }, props: { styleOptions } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('avatar background color', async () => {
  const styleOptions = {
    botAvatarBackgroundColor: 'red',
    botAvatarInitials: 'B',
    userAvatarBackgroundColor: 'blue',
    userAvatarInitials: 'TJ'
  };

  const { driver, pageObjects } = await setupWebDriver({ props: { styleOptions } });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo "Hello, World!"', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
