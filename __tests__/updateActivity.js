import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

jest.setTimeout(timeouts.test);

test('should replace activity with same activity ID', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);
      let firstBotActivityId;
      let firstBotActivityTimestamp;

      return {
        activity$: workingDirectLine.activity$.map(activity => {
          if (!activity.channelData && activity.type === 'message') {
            // Duplicate the ID using the first message activity from bot.

            if (firstBotActivityId) {
              return Object.assign({}, activity, {
                id: firstBotActivityId,
                timestamp: firstBotActivityTimestamp
              });
            }

            firstBotActivityId = activity.id;
            firstBotActivityTimestamp = activity.timestamp;
          }

          return activity;
        }),
        connectionStatus$: workingDirectLine.connectionStatus$,
        postActivity: workingDirectLine.postActivity.bind(workingDirectLine),
        token: workingDirectLine.token
      };
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo This message will be replaced by a carousel.', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.sendMessageViaSendBox('carousel', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
});

test('should not replace activity without activity ID', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);

      return {
        activity$: workingDirectLine.activity$.map(activity => {
          if (!activity.channelData && activity.type === 'message') {
            // Remove all activity ID from bot

            return Object.assign({}, activity, { id: undefined });
          }

          return activity;
        }),
        connectionStatus$: workingDirectLine.connectionStatus$,
        postActivity: workingDirectLine.postActivity.bind(workingDirectLine),
        token: workingDirectLine.token
      };
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('echo This message will not be replaced by a carousel.', {
    waitForSend: true
  });
  await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

  await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.sendMessageViaSendBox('carousel', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(5), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
});
