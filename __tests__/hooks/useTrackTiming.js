import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

jest.setTimeout(timeouts.test);

describe('useTrackTiming', () => {
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
              error,
              name,
              type
            });
        }
      },
      setup: () =>
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js').then(() => {
          window.WebChatTest.clock = lolex.install();
        })
    });

    driver = setup.driver;
    pageObjects = setup.pageObjects;

    await driver.executeScript(() => window.WebChatTest.clock.tick(400));
    await driver.wait(uiConnected(), timeouts.directLine);
  });

  test('should track timing for function', async () => {
    await expect(
      pageObjects.runHook('useTrackTiming', [], trackTiming => trackTiming('ping', () => 123))
    ).resolves.toBe(123);

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
          "error": null,
          "name": "ping",
          "type": "timingstart",
        },
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": 0,
          "error": null,
          "name": "ping",
          "type": "timingend",
        },
      ]
    `);
  });

  test('should track timing for Promise', async () => {
    await pageObjects.runHook('useTrackTiming', [], trackTiming => {
      trackTiming('ping', new Promise(resolve => setTimeout(() => resolve(123), 1000))).then(result => {
        window.WebChatTest.result = result;
      });
    });

    await driver.executeScript(() => window.WebChatTest.clock.tick(1000));

    await expect(driver.executeScript(() => window.WebChatTest.result)).resolves.toBe(123);

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
          "error": null,
          "name": "ping",
          "type": "timingstart",
        },
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": 1000,
          "error": null,
          "name": "ping",
          "type": "timingend",
        },
      ]
    `);
  });
});
