import { Condition } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import runHook from './setup/pageObjects/runHook';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

function expectLanguage(expected) {
  return new Condition(`language changed to "${expected}"`, async driver => {
    const [language] = await runHook(driver, 'useLanguage');

    return language === expected;
  });
}

test('update timestamp language on-the-fly', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo Hello, World!', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ locale: 'zh-HK' });
  await driver.wait(expectLanguage('zh-Hant-HK'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ locale: 'yue' });
  await driver.wait(expectLanguage('yue'), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('timestamp should update time', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await pageObjects.sendMessageViaSendBox('echo timestamp', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  await driver.executeScript(() => {
    window.WebChatTest.clock.tick(330000); // t = 5.5 minutes
  });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('prepend text', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      activityStatusMiddleware: () => next => args => {
        const nextRender = next(args);

        if (nextRender) {
          if (args.activity.from.role === 'user') {
            return React.createElement('span', {}, ['User at ', nextRender]);
          } else {
            return React.createElement('span', {}, ['Bot at ', nextRender]);
          }
        }

        return nextRender;
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo Hello, World!', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('change timestamp grouping on-the-fly', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo Hello, World!', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ styleOptions: { groupTimestamp: 0 } });

  // After setting group timestamp to 0 second, it should show two separate timestamps.
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ styleOptions: { groupTimestamp: false } });

  // After setting group timestamp to false, it should not show any timestamps.
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('change send timeout on-the-fly', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);

      return {
        activity$: workingDirectLine.activity$,
        connectionStatus$: workingDirectLine.connectionStatus$,
        postActivity: activity =>
          activity.type === 'message' ? new Observable(() => {}) : workingDirectLine.postActivity(activity)
      };
    },
    props: {
      styleOptions: {
        sendTimeout: 5000
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

  // Advance 1 second for the connection status prompt to be gone.
  await driver.executeScript(() => window.WebChatTest.clock.tick(1000));

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo Hello, World!', { waitForSend: false });

  await driver.executeScript(() => window.WebChatTest.clock.tick(5000));

  await driver.wait(
    new Condition('turn into "Send failed. Retry.', driver =>
      driver.executeScript(
        () =>
          document.querySelector('.webchat__row.message + .webchat__row [aria-hidden]').innerText ===
          'Send failed. Retry.'
      )
    ),
    timeouts.ui
  );

  // After 5 seconds, it should show timeout.
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ styleOptions: { sendTimeout: 10000 } });

  await driver.wait(
    new Condition('turn into "Sending"', driver =>
      driver.executeScript(
        () => document.querySelector('.webchat__row.message + .webchat__row [aria-hidden]').innerText === 'Sending'
      )
    ),
    timeouts.ui
  );

  // After changing the send timeout to 10 seconds, it should show "sending".
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.executeScript(() => window.WebChatTest.clock.tick(5000));

  await driver.wait(
    new Condition('turn into "Send failed. Retry.', driver =>
      driver.executeScript(
        () =>
          document.querySelector('.webchat__row.message + .webchat__row [aria-hidden]').innerText ===
          'Send failed. Retry.'
      )
    ),
    timeouts.ui
  );

  // After 10 seconds, it should show timeout again.
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('send timeout for attachment should be different', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);

      return {
        activity$: workingDirectLine.activity$,
        connectionStatus$: workingDirectLine.connectionStatus$,
        postActivity: activity =>
          activity.type === 'message' ? new Observable(() => {}) : workingDirectLine.postActivity(activity)
      };
    },
    props: {
      styleOptions: {
        sendTimeout: 20000
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

  // Advance 1 second for the connection status prompt to be gone.
  await driver.executeScript(() => window.WebChatTest.clock.tick(1000));

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendFile('empty.zip', { waitForSend: false });

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.executeScript(() => window.WebChatTest.clock.tick(20000));

  // After 20 seconds, it should still show "sending".
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.executeScript(() => window.WebChatTest.clock.tick(100000));

  // After 120 seconds, it should show time out.
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({ styleOptions: { sendTimeoutForAttachments: 130000 } });

  // After changing the timeout to 130 seconds, it should show "sending".
  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
