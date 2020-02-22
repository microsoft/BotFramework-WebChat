import { timeouts } from './constants.json';

import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('telemetry', () => {
  test('should collect "init" event', async () => {
    const { driver } = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, name, type, value } = event;

          (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
            data,
            dimensions,
            duration,
            error,
            name,
            type,
            value
          });
        }
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "name": "init",
          "type": "event",
          "value": null,
        },
      ]
    `);
  });
});
