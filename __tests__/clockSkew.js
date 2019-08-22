import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import allImagesLoaded from './setup/conditions/allImagesLoaded';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('Clock skew', () => {
  let driver, pageObjects;

  beforeEach(async () => {
    const result = await setupWebDriver({
      createDirectLine: options => {
        const workingDirectLine = window.WebChat.createDirectLine(options);
        const activityBroker = window.createProduceConsumeBroker();
        const activityObservers = [];

        const activitySubscription = workingDirectLine.activity$.subscribe({
          complete() {
            activityObservers.forEach(activityObserver => activityObserver.complete());
          },
          error(err) {
            activityObservers.forEach(activityObserver => activityObserver.error(err));
          },
          next(activity) {
            activityBroker.produce(
              Object.assign({}, activity, {
                timestamp: new Date(Date.parse(activity.timestamp) + 60000).toISOString()
              })
            );
          }
        });

        window.WebChatTest.releaseActivity = (numTimes = 1, skipFromUser = false) => {
          for (; numTimes > 0; numTimes--) {
            activityBroker.consume(activity => {
              if (!skipFromUser || !/^dl_/u.test(activity.from.id)) {
                activityObservers.forEach(activityObserver => activityObserver.next(activity));
              }
            });
          }
        };

        return {
          activity$: new Observable(observer => {
            activityObservers.push(observer);

            return {
              unsubscribe: () => {
                activityObservers = activityObservers.filter(activityObserver => activityObserver !== observer);
                !activityObservers.length && activitySubscription.unsubscribe();
              }
            };
          }),
          connectionStatus$: workingDirectLine.connectionStatus$,
          getSessionId: () => 0,
          postActivity: workingDirectLine.postActivity.bind(workingDirectLine),
          token: workingDirectLine.token
        };
      },
      pingBotOnLoad: false,
      setup: () => {
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js');
      }
    });

    driver = result.driver;
    pageObjects = result.pageObjects;
  });

  test('should not have any effects', async () => {
    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('card bingsports', { waitForSend: false });

    await driver.executeScript(() => window.WebChatTest.releaseActivity(2));

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

    // Specifically set a large clock skew to make sure the 2nd user-originated activity has a positive clock skew (appears on bottom).
    // A large positive clock skew is used to test if it is below the 2nd bot-originated activity or not.
    // Recently, we found the clock in the Docker image has a clockskew of 1.1 hours. So putting a huge number like 10 days should make it work.
    await pageObjects.dispatchAction({
      payload: { value: 864000000 },
      type: 'WEB_CHAT/SET_CLOCK_SKEW_ADJUSTMENT'
    });

    // Make sure the clock skew is set correctly.
    // If it is not set, the result could be false-positive.
    await expect(pageObjects.getStore()).resolves.toHaveProperty('clockSkewAdjustment', 864000000);

    await pageObjects.sendMessageViaSendBox('echo This outgoing activity should be the last in the list.', {
      waitForSend: false
    });

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    const lastActivity = await driver.findElement(By.css('[role="list"] > li:last-child p'));

    await expect(lastActivity.getText()).resolves.toBe('echo This outgoing activity should be the last in the list.');

    // Skip the echoback for 2nd user-originated activity, so we don't apply server timestamp to it. It will be visually appear as "sending".
    // Even the 2nd user-originated activity didn't apply server timestamp, the insertion-sort algorithm should put bot-originated activity below it.
    await driver.executeScript(() => window.WebChatTest.releaseActivity(3, true));
    await driver.wait(minNumActivitiesShown(5), timeouts.directLine);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('faking clock skew should affect activity order', async () => {
    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('card bingsports', { waitForSend: false });

    await driver.executeScript(() => window.WebChatTest.releaseActivity(2));

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

    // Specifically set a large clock skew to make sure the 2nd user-originated activity has a negative clock skew (appears on top).
    await pageObjects.dispatchAction({
      payload: { value: -864000000 },
      type: 'WEB_CHAT/SET_CLOCK_SKEW_ADJUSTMENT'
    });

    // Make sure the clock skew is set correctly.
    // If it is not set, the result could be false-positive.
    await expect(pageObjects.getStore()).resolves.toHaveProperty('clockSkewAdjustment', -864000000);

    await pageObjects.sendMessageViaSendBox(
      'echo This outgoing activity should be the first in the list before echo back, and last after the echo back.',
      {
        waitForSend: false
      }
    );

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    const firstActivity = await driver.findElement(By.css('[role="list"] > li:first-child p'));

    await expect(firstActivity.getText()).resolves.toBe(
      'echo This outgoing activity should be the first in the list before echo back, and last after the echo back.'
    );

    await driver.executeScript(() => window.WebChatTest.releaseActivity(3));
    await driver.wait(minNumActivitiesShown(5), timeouts.directLine);
    await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);
    await driver.wait(allImagesLoaded(), timeouts.fetch);

    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
