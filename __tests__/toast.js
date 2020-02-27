import { imageSnapshotOptions, timeouts } from './constants.json';

import negationOf from './setup/conditions/negationOf';
import toasterExpandable from './setup/conditions/toasterExpandable';
import toasterExpanded from './setup/conditions/toasterExpanded';
import toastShown from './setup/conditions/toastShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('show a notification, update, and dismiss it', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await driver.executeScript(() => window.WebChatTest.clock.tick(400));

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'privacypolicy',
      level: 'info',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy).'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'privacypolicy',
      level: 'warn',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy) again.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/DISMISS_NOTIFICATION',
    payload: {
      id: 'privacypolicy'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(toastShown(0), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('customize toast debounce time on update and dismiss', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        notificationDebounceTimeout: 1000
      }
    },
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await driver.executeScript(() => window.WebChatTest.clock.tick(1000));

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'privacypolicy',
      level: 'info',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy).'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'privacypolicy',
      level: 'warn',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy) again.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(600));
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/DISMISS_NOTIFICATION',
    payload: {
      id: 'privacypolicy'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);
  await driver.executeScript(() => window.WebChatTest.clock.tick(600));
  await driver.wait(toastShown(0), timeouts.ui);
});

test('show two very long notifications', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'lorem ipsum 1',
      level: 'info',
      message:
        'Magna ut culpa ad adipisicing aliquip veniam pariatur. Laboris laboris do irure laborum quis nisi aliquip Lorem adipisicing pariatur Lorem magna pariatur. Proident mollit culpa commodo ex sint consectetur esse incididunt. Do ullamco voluptate reprehenderit cupidatat cupidatat. Aliquip anim sint proident et ullamco. Deserunt adipisicing cillum anim eiusmod nostrud sit magna pariatur in nulla. Aliquip in irure incididunt cillum non anim Lorem commodo incididunt nisi eu eu pariatur.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'lorem ipsum 2',
      level: 'info',
      message: 'Cupidatat cupidatat duis irure do dolor. Id eu ut esse minim aute. Nulla mollit in irure.'
    }
  });

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: 'lorem ipsum 3',
      level: 'info',
      message: 'Ut adipisicing consectetur laborum.'
    }
  });

  await driver.wait(toasterExpandable(), timeouts.ui);
  await driver.wait(negationOf(toasterExpanded()), timeouts.ui);

  await pageObjects.clickToasterHeader();

  await driver.wait(toastShown(3), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/DISMISS_NOTIFICATION',
    payload: {
      id: 'lorem ipsum 1'
    }
  });

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/DISMISS_NOTIFICATION',
    payload: {
      id: 'lorem ipsum 2'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
