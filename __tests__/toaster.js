import { imageSnapshotOptions, timeouts } from './constants.json';

import negationOf from './setup/conditions/negationOf';
import toasterExpandable from './setup/conditions/toasterExpandable';
import toasterExpanded from './setup/conditions/toasterExpanded';
import toastShown from './setup/conditions/toastShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('show 2 notifications, expand, close one, and add new', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install({ shouldAdvanceTime: true });
      })
  });

  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '1',
      level: 'info',
      message: 'Notification 1.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '2',
      level: 'error',
      message: 'Notification 2.'
    }
  });

  await driver.wait(toasterExpandable(), timeouts.ui);
  await driver.wait(negationOf(toasterExpanded()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.clickToasterHeader();
  await driver.wait(toasterExpanded(), timeouts.ui);
  await driver.wait(toastShown(2), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/DISMISS_NOTIFICATION',
    payload: {
      id: '2'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(negationOf(toasterExpandable()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '3',
      level: 'success',
      message: 'Notification 3.'
    }
  });

  await driver.wait(toasterExpandable(), timeouts.ui);
  await driver.wait(negationOf(toasterExpanded()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('show 2 notifications, expand, and collapse', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install({ shouldAdvanceTime: true });
      })
  });

  await driver.executeScript(() => window.WebChatTest.clock.tick(400));
  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '1',
      level: 'info',
      message: 'Notification 1.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '2',
      level: 'error',
      message: 'Notification 2.'
    }
  });

  await driver.wait(toasterExpandable(), timeouts.ui);
  await driver.wait(negationOf(toasterExpanded()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.clickToasterHeader();
  await driver.wait(toasterExpanded(), timeouts.ui);
  await driver.wait(toastShown(2), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.clickToasterHeader();
  await driver.wait(negationOf(toasterExpanded()), timeouts.ui);
  await driver.wait(toastShown(0), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('hide toaster', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        hideToaster: true
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '1',
      level: 'info',
      message: 'Notification 1.'
    }
  });

  await driver.wait(toastShown(0), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({
    styleOptions: {
      hideToaster: false
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({
    styleOptions: {
      hideToaster: true
    }
  });

  await driver.wait(toastShown(0), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('move recently updated toast to the top', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install({ shouldAdvanceTime: true });
      })
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '1',
      level: 'info',
      message: 'Notification 1.'
    }
  });

  await driver.wait(toastShown(1), timeouts.ui);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '2',
      level: 'error',
      message: 'Notification 2.'
    }
  });

  await driver.wait(toasterExpandable(), timeouts.ui);
  await pageObjects.clickToasterHeader();
  await driver.wait(toastShown(2), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.dispatchAction({
    type: 'WEB_CHAT/SET_NOTIFICATION',
    payload: {
      id: '1',
      level: 'info',
      message: 'Notification 1, placed to top.'
    }
  });

  // Wait for the DOM to reflect the change.
  await driver.wait(
    () =>
      driver.executeScript(
        () =>
          ~document.querySelector(`.webchat__toaster__listItem`)?.innerText?.indexOf('Notification 1, placed to top.')
      ),
    timeouts.ui
  );

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
