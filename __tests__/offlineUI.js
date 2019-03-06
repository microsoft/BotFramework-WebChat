import { By, Condition, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

const allOutgoingMessagesFailed = new Condition('All outgoing messages to fail sending', driver => {
  return driver.executeScript(() => {
    const { store } = window.WebChatTest;
    const { activities } = store.getState();

    return activities.filter(({ from: { role }, type }) => role === 'user' && type === 'message').every(({ channelData: { state } }) => state === 'send failed');
  });
});

describe('offline UI', async () => {
  test('should show "slow to connect" UI when connection is slow', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        const workingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: workingDirectLine.activity$,
          postActivity: workingDirectLine.postActivity.bind(workingDirectLine),

          connectionStatus$: new Observable(observer => {
            const subscription = workingDirectLine.connectionStatus$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: connectionStatus => {
                connectionStatus !== 2 && observer.next(connectionStatus);
              }
            });

            return () => subscription.unsubscribe();
          })
        };
      },
      pingBotOnLoad: false,
      setup: () => new Promise(resolve => {
        const scriptElement = document.createElement('script');

        scriptElement.onload = resolve;
        scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

        document.head.appendChild(scriptElement);
      })
    });

    await driver.sleep(15000);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should show "unable to connect" UI when credentials are incorrect', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: () => {
        return window.WebChat.createDirectLine({ token: 'INVALID-TOKEN' });
      },
      pingBotOnLoad: false,
      setup: () => new Promise(resolve => {
        const scriptElement = document.createElement('script');

        scriptElement.onload = resolve;
        scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

        document.head.appendChild(scriptElement);
      })
    });

    await driver.wait(async driver => {
      return await driver.executeScript(() =>
        !!~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_REJECTED')
      );
    }, timeouts.directLine);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should display "Send failed. Retry" when activity is not able to send', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        const workingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: workingDirectLine.activity$,
          connectionStatus$: workingDirectLine.connectionStatus$,
          postActivity: activity => {
            if (activity.type === 'message') {
              return new Observable(({ error }) => error(new Error('artificial error')));
            } else {
              return workingDirectLine.postActivity(activity);
            }
          }
        };
      },
      setup: () => new Promise(resolve => {
        const scriptElement = document.createElement('script');

        scriptElement.onload = resolve;
        scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

        document.head.appendChild(scriptElement);
      })
    });

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('42', Key.RETURN);
    await driver.wait(allOutgoingMessagesFailed, timeouts.postActivity);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should display "Send failed. Retry" when activity is sent but not acknowledged', async() => {
    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        const workingDirectLine = window.WebChat.createDirectLine(options);
        const bannedClientActivityIDs = [];

        return {
          activity$: new Observable(observer => {
            const subscription = workingDirectLine.activity$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: activity => {
                const { channelData: { clientActivityID } = {} } = activity;

                !bannedClientActivityIDs.includes(clientActivityID) && observer.next(activity);
              }
            });

            return () => subscription.unsubscribe();
          }),
          connectionStatus$: workingDirectLine.connectionStatus$,
          postActivity: activity => {
            const {
              channelData: { clientActivityID },
              type
            } = activity;

            type === 'message' && bannedClientActivityIDs.push(clientActivityID);

            return workingDirectLine.postActivity(activity);
          }
        };
      },
      setup: () => new Promise(resolve => {
        const scriptElement = document.createElement('script');

        scriptElement.onload = resolve;
        scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

        document.head.appendChild(scriptElement);
      })
    });

    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('42', Key.RETURN);
    await driver.wait(allOutgoingMessagesFailed, timeouts.postActivity);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
