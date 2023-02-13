import { timeouts } from './constants.json';

import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);
jest.setTimeout(20000);

describe('telemetry', () => {
  test('should collect "init" event', async () => {

    const { driver } = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, fatal, name, type, value } = event;

          window.WebChatTest.telemetryMeasurements.push({
            data,
            dimensions,
            duration,
            error,
            fatal,
            name,
            type,
            value
          });
        }
      },
      setup: () => {
        window.WebChatTest.telemetryMeasurements = [];
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await expect(
      driver.executeScript(() => window.WebChatTest.telemetryMeasurements.filter(({ name }) => name === 'init'))
    ).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "fatal": null,
          "name": "init",
          "type": "event",
          "value": null,
        },
      ]
    `);
  });

  test('should collect fatal error', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        activityMiddleware:
          () =>
          () =>
          ({ activity: { text = '' } }) => {
            return () => {
              if (~text.indexOf('error')) {
                throw new Error('artificial error');
              }

              return false;
            };
          },
        onTelemetry: event => {
          const { data, dimensions, duration, error, fatal, name, type, value } = event;

          (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
            data,
            dimensions,
            duration,
            error,
            fatal,
            name,
            type,
            value
          });
        }
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('error', { waitForSend: false });
    await driver.wait(() =>
      driver.executeScript(() => window.WebChatTest.telemetryMeasurements.find(({ type }) => type === 'exception'))
    );

    await expect(
      driver.executeScript(
        () => window.WebChatTest.telemetryMeasurements.find(({ type }) => type === 'exception').error.message
      )
    ).resolves.toMatchInlineSnapshot(`"artificial error"`);
  });
});
