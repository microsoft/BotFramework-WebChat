import { By } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negationOf from './setup/conditions/negationOf';
import scrollToBottomButtonVisible from './setup/conditions/scrollToBottomButtonVisible';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import suggestedActionsShown from './setup/conditions/suggestedActionsShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should stick to bottom if submitting an Adaptive Card while suggested actions is open', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('card inputs', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('suggested-actions', { waitForSend: true });
  await driver.wait(suggestedActionsShown(), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  const submitButton = await driver.findElement(By.css('button.ac-pushButton:nth-of-type(2)'));

  await submitButton.click();
  await driver.wait(minNumActivitiesShown(5), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});

test('should scroll to bottom on send', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('help');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await pageObjects.scrollToTop();

  await driver.wait(negationOf(scrollToBottomButtonVisible()), timeouts.ui);

  // Should scroll to bottom on send

  await pageObjects.sendMessageViaSendBox('Hello, World!');
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('show "New messages" button only when new message come', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);

      return {
        activity$: new Observable(activityObserver => {
          window.WebChatTest.activityObserver = activityObserver;

          const subscription = workingDirectLine.activity$.subscribe({
            complete: () => activityObserver.complete(),
            error: value => activityObserver.error(value),
            next: value => activityObserver.next(value)
          });

          return () => subscription.unsubscribe();
        }),
        connectionStatus$: workingDirectLine.connectionStatus$,
        postActivity: workingDirectLine.postActivity.bind(workingDirectLine),
        token: workingDirectLine.token
      };
    },
    setup: () => window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js')
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('help');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  // Should not show "New message" button because no new message coming in

  await pageObjects.scrollToTop();

  await driver.wait(negationOf(scrollToBottomButtonVisible()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  // Should show "New message" button when new message came in

  await driver.executeScript(() => {
    window.WebChatTest.activityObserver.next({
      from: {
        id: 'bot',
        role: 'bot'
      },
      text: 'Hello, World!',
      type: 'message'
    });
  });

  await driver.wait(scrollToBottomButtonVisible(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.clickScrollToBottomButton();
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
  await driver.wait(negationOf(scrollToBottomButtonVisible()), timeouts.ui);

  // Should stick to bottom

  await driver.executeScript(() => {
    window.WebChatTest.activityObserver.next({
      from: {
        id: 'bot',
        role: 'bot'
      },
      text: 'Aloha!',
      type: 'message'
    });
  });

  await driver.wait(minNumActivitiesShown(4), timeouts.directLine);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.scrollToTop();

  await driver.wait(negationOf(scrollToBottomButtonVisible()), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
