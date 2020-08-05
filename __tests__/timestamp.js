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
  await driver.wait(expectLanguage('zh-HK'), timeouts.ui);

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

  await driver.executeScript(() => window.WebChatTest.clock.tick(1));

  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  await driver.executeScript(() => window.WebChatTest.clock.tick(330000)); // t = 5.5 minutes

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('prepend text', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      activityStatusMiddleware: () => next => args => {
        const nextRender = next(args);

        // "nextRender" may render a screen reader only timestamp. Thus, not returning falsy.
        // We should only prepend when "hideTimestamp" is not set.
        if (!args.hideTimestamp) {
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
