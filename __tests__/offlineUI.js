import { By, Condition, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import actionDispatched from './setup/conditions/actionDispatched';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import staticSpinner from './setup/assets/staticSpinner';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

const allOutgoingMessagesFailed = new Condition('All outgoing messages to fail sending', driver => {
  return driver.executeScript(() => {
    const { store } = window.WebChatTest;
    const { activities } = store.getState();

    return activities
      .filter(({ from: { role }, type }) => role === 'user' && type === 'message')
      .every(({ channelData: { state } }) => state === 'send failed');
  });
});

describe('offline UI', async () => {
  test('should show "Taking longer than usual to connect" UI when connection is slow', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        // This part of code is running in the JavaScript VM in Chromium.
        // This variable must be declared within scope
        const ONLINE = 2;

        const workingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: workingDirectLine.activity$,
          postActivity: workingDirectLine.postActivity.bind(workingDirectLine),

          connectionStatus$: new Observable(observer => {
            const subscription = workingDirectLine.connectionStatus$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: connectionStatus => {
                connectionStatus !== ONLINE && observer.next(connectionStatus);
              }
            });

            return () => subscription.unsubscribe();
          })
        };
      },
      pingBotOnLoad: false,
      setup: () =>
        Promise.all([
          window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
          window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
        ]).then(() => {
          window.WebChatTest.clock = lolex.install();
        })
    });

    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(400); // "Connecting" will be gone after 400ms, turning into "Taking longer than usual to connect"
      window.WebChatTest.clock.tick(14600); // Go to t=15s
    });

    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(1); // Shortly after 15s, it will show "Taking longer than usual to connect"
    });

    await driver.wait(actionDispatched('DIRECT_LINE/CONNECT_STILL_PENDING'), timeouts.directLine);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should show "unable to connect" UI when credentials are incorrect', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: () => {
        return window.WebChat.createDirectLine({ token: 'INVALID-TOKEN' });
      },
      pingBotOnLoad: false,
      setup: () =>
        new Promise(resolve => {
          const scriptElement = document.createElement('script');

          scriptElement.onload = resolve;
          scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

          document.head.appendChild(scriptElement);
        })
    });

    await driver.wait(async driver => {
      return await driver.executeScript(
        () => !!~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_REJECTED')
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
      setup: () =>
        new Promise(resolve => {
          const scriptElement = document.createElement('script');

          scriptElement.onload = resolve;
          scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

          document.head.appendChild(scriptElement);
        })
    });
    await driver.wait(uiConnected(), 10000);
    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('42', Key.RETURN);
    await driver.wait(allOutgoingMessagesFailed, timeouts.postActivity);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should display "Send failed. Retry" when activity is sent but not acknowledged', async () => {
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
      setup: () =>
        new Promise(resolve => {
          const scriptElement = document.createElement('script');

          scriptElement.onload = resolve;
          scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

          document.head.appendChild(scriptElement);
        })
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    const input = await driver.findElement(By.css('input[type="text"]'));

    await input.sendKeys('42', Key.RETURN);
    await driver.wait(allOutgoingMessagesFailed, timeouts.postActivity);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should display the "Connecting..." connectivity status when connecting for the first time', async () => {
    const WEB_CHAT_PROPS = { styleOptions: { spinnerAnimationBackgroundImage: staticSpinner } };

    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        // This part of code is running in the JavaScript VM in Chromium.
        // This Direct Line Connection Status variable must be declared within scope
        const UNINITIALIZED = 0;

        const workingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: workingDirectLine.activity$,
          postActivity: workingDirectLine.postActivity.bind(workingDirectLine),

          connectionStatus$: new Observable(observer => {
            const subscription = workingDirectLine.connectionStatus$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: connectionStatus => {
                connectionStatus === UNINITIALIZED && observer.next(connectionStatus);
              }
            });

            return () => subscription.unsubscribe();
          })
        };
      },
      pingBotOnLoad: false,
      props: WEB_CHAT_PROPS,
      setup: () =>
        new Promise(resolve => {
          const scriptElement = document.createElement('script');

          scriptElement.onload = resolve;
          scriptElement.setAttribute('src', 'https://unpkg.com/core-js@2.6.3/client/core.min.js');

          document.head.appendChild(scriptElement);
        })
    });

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should display "Network interruption occurred. Reconnecting…" status when connection is interrupted', async () => {
    const WEB_CHAT_PROPS = { styleOptions: { spinnerAnimationBackgroundImage: staticSpinner } };

    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        // This part of code is running in the JavaScript VM in Chromium.
        // These Direct Line Connection Status variables must be declared within scope
        const CONNECTING = 1;

        const ONLINE = 2;

        const reconnectingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: reconnectingDirectLine.activity$,
          postActivity: reconnectingDirectLine.postActivity.bind(reconnectingDirectLine),

          connectionStatus$: new Observable(observer => {
            const subscription = reconnectingDirectLine.connectionStatus$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: connectionStatus => {
                observer.next(connectionStatus);
                connectionStatus === ONLINE && observer.next(CONNECTING);
              }
            });

            return () => subscription.unsubscribe();
          })
        };
      },
      pingBotOnLoad: false,
      props: WEB_CHAT_PROPS,
      setup: () =>
        Promise.all([
          window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
          window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
        ]).then(() => {
          window.WebChatTest.clock = lolex.install();
        })
    });

    await driver.wait(actionDispatched('DIRECT_LINE/CONNECT_PENDING'), timeouts.directLine);
    await driver.wait(actionDispatched('DIRECT_LINE/CONNECT_FULFILLED'), timeouts.directLine);
    await driver.wait(actionDispatched('DIRECT_LINE/CONNECT_PENDING'), timeouts.directLine);

    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(400); // "Connecting" will be gone after 400ms, turning into "Network interruption occured"
      window.WebChatTest.clock.tick(200);
    });

    // TODO: [P4] Understand why we need to fire tick() using two cross-VM calls
    //       When we put everything in a single cross-VM call, the last tick has no effect
    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(1); // Shortly after 15s, it will show "Network interruption occured."
    });

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should show "Taking longer than usual to connect" UI when reconnection is slow', async () => {
    const { driver } = await setupWebDriver({
      createDirectLine: options => {
        // This part of code is running in the JavaScript VM in Chromium.
        // These Direct Line Connection Status variables must be declared within scope
        const CONNECTING = 1;

        const ONLINE = 2;

        const reconnectingDirectLine = window.WebChat.createDirectLine(options);

        return {
          activity$: reconnectingDirectLine.activity$,
          postActivity: reconnectingDirectLine.postActivity.bind(reconnectingDirectLine),

          connectionStatus$: new Observable(observer => {
            const subscription = reconnectingDirectLine.connectionStatus$.subscribe({
              complete: () => observer.complete(),
              error: err => observer.error(err),
              next: connectionStatus => {
                observer.next(connectionStatus);
                connectionStatus === ONLINE && observer.next(CONNECTING);
              }
            });

            return () => subscription.unsubscribe();
          })
        };
      },
      pingBotOnLoad: false,
      setup: () =>
        Promise.all([
          window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
          window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
        ]).then(() => {
          window.WebChatTest.clock = lolex.install();
        })
    });

    await driver.wait(actionDispatched('DIRECT_LINE/RECONNECT_PENDING'), timeouts.directLine);

    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(400); // "Connecting" will be gone after 400ms
      window.WebChatTest.clock.tick(14600); // Go to t=15s
    });

    // TODO: [P4] Understand why we need to fire tick() using two cross-VM calls
    //       When we put everything in a single cross-VM call, the last tick has no effect
    await driver.executeScript(() => {
      window.WebChatTest.clock.tick(1); // Shortly after 15s, it will show "Taking longer than usual to connect"
    });

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('should show "Render error" connectivity status when a JavaScript error is present in the code.', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      storeMiddleware: ({ dispatch }) => next => action => {
        if (
          action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' &&
          action.payload.activity &&
          action.payload.activity.text === 'error'
        ) {
          dispatch({
            type: 'DIRECT_LINE/POST_ACTIVITY',
            payload: {}
          });
        }

        return next(action);
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('error', { waitForSend: false });
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(actionDispatched('WEB_CHAT/SAGA_ERROR'), timeouts.directLine);

    const base64PNG = await driver.takeScreenshot();

    expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
