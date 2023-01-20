import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

jest.setTimeout(timeouts.test);

describe('useTrackException', () => {
  let driver;
  let pageObjects;

  beforeEach(async () => {
    const setup = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, fatal, name, type } = event;

          name !== 'init' &&
            (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
              data,
              dimensions,
              duration,
              error: error.message,
              fatal,
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
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": "artificial error",
          "fatal": true,
          "name": null,
          "type": "exception",
        },
      ]
    `);
  });

  test('should track non-fatal exception', async () => {
    await pageObjects.runHook('useTrackException', [], trackException =>
      trackException(new Error('non-fatal error'), false)
    );

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
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
          "error": "non-fatal error",
          "fatal": false,
          "name": null,
          "type": "exception",
        },
      ]
    `);
  });
});
