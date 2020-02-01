import { imageSnapshotOptions, timeouts } from './constants.json';

// import allImagesLoaded from './setup/conditions/allImagesLoaded';
// import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown.js';
import notificationShown from './setup/conditions/notificationShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('show a notification then auto-dismiss it with debounce', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(uiConnected(), timeouts.directLine);

  pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'connectivity',
      message: 'Connecting...',
      persistent: true
    }
  });

  await driver.wait(notificationShown('Connecting...'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      expireAt: 0,
      id: 'connectivity',
      message: 'Connected',
      persistent: true
    }
  });

  await driver.wait(notificationShown('Connected'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.executeScript(() => window.WebChatTest.clock.tick(200));
  await driver.wait(notificationShown('Connected'), timeouts.ui);

  await driver.executeScript(() => window.WebChatTest.clock.tick(200));
  await driver.wait(notificationShown(0), timeouts.ui);
});
