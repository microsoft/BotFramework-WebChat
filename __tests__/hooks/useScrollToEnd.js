import { imageSnapshotOptions, timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import scrollToBottomButtonVisible from '../setup/conditions/scrollToBottomButtonVisible';
import scrollToBottomCompleted from '../setup/conditions/scrollToBottomCompleted';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling scrollToEnd should scroll to end', async () => {
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

  await pageObjects.scrollToTop();

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

  await pageObjects.runHook('useScrollToEnd', [], scrollToEnd => scrollToEnd());
  await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
