import { By, Condition, Key } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';
import allOutgoingActivitiesSent from './setup/conditions/allOutgoingActivitiesSent';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('Clock skew', () => {
  test('should not have any effects', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      createDirectLine: options => {
        function createProducerConsumer() {
          const consumers = [];
          const jobs = [];

          return {
            cancel() {
              jobs.splice(0);
            },
            consume(consumer) {
              consumers.push(consumer);

              if (jobs.length) {
                const consumer = consumers.shift();

                consumer.apply(consumer, jobs.shift());
              }
            },
            hasConsumer() {
              return !!consumers.length;
            },
            hasJob() {
              return !!jobs.length;
            },
            peek() {
              return jobs[0];
            },
            produce(...args) {
              jobs.push(args);

              if (consumers.length) {
                const consumer = consumers.shift();

                consumer.apply(consumer, jobs.shift());
              }
            }
          };
        }

        const workingDirectLine = window.WebChat.createDirectLine(options);
        const activityBroker = createProducerConsumer();
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

        window.WebChatTest.releaseActivity = () => {
          activityBroker.consume(activity => {
            activityObservers.forEach(activityObserver => activityObserver.next(activity));
          });
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
          postActivity: workingDirectLine.postActivity.bind(workingDirectLine)
        };
      },
      pingBotOnLoad: false,
      props: {
        userID: 'user'
      },
      setup: () => {
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js');
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('card bingsports', { waitForSend: false });

    await driver.executeScript(() => window.WebChatTest.releaseActivity());
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    await driver.executeScript(() => window.WebChatTest.releaseActivity());
    await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);

    await pageObjects.sendMessageViaSendBox('echo This outgoing activity should be the last in the list.', {
      waitForSend: false
    });
    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    const lastActivity = await driver.findElement(By.css('[role="list"] > li:last-child p'));

    expect(lastActivity.getText()).resolves.toBe('echo This outgoing activity should be the last in the list.');
  });
});
