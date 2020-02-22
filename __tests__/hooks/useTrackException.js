import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

describe('useTrackException', () => {
  let driver;
  let pageObjects;

  beforeEach(async () => {
    const setup = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, name, type } = event;

          name !== 'init' &&
            (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
              data,
              dimensions,
              duration,
              error: error.message,
              name,
              type
            });
        }
      }
    });

    driver = setup.driver;
    pageObjects = setup.pageObjects;

    await driver.wait(uiConnected(), timeouts.directLine);
  });

  test('should track exception', async () => {
    await pageObjects.runHook('useTrackException', [], trackException => trackException(new Error('artificial error')));

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
          "error": "artificial error",
          "name": null,
          "type": "exception",
        },
      ]
    `);
  });
});
