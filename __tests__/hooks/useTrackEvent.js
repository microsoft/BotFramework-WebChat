import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

jest.setTimeout(timeouts.test);

describe('useTrackEvent', () => {
  let driver;
  let pageObjects;

  beforeEach(async () => {
    const setup = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, level, name, type } = event;

          name !== 'init' &&
            (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
              data,
              dimensions,
              duration,
              error,
              level,
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

  test('should track simple event', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('hello'));

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
          "level": "info",
          "name": "hello",
          "type": "event",
        },
      ]
    `);
  });

  test('should track simple event using info explicitly', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent.info('hello'));

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
          "level": "info",
          "name": "hello",
          "type": "event",
        },
      ]
    `);
  });

  test('should track numeric event', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent.warn('hello', 123));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": 123,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "level": "warn",
          "name": "hello",
          "type": "event",
        },
      ]
    `);
  });

  test('should track numeric event', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent.debug('hello', 'aloha'));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": "aloha",
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "level": "debug",
          "name": "hello",
          "type": "event",
        },
      ]
    `);
  });

  test('should track complex event', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent.error('hello', { one: 1, hello: 'aloha' }));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": Object {
            "hello": "aloha",
            "one": 1,
          },
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "capability:renderer": "html",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "level": "error",
          "name": "hello",
          "type": "event",
        },
      ]
    `);
  });

  test('should not track event with boolean data', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('hello', true));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toBeFalsy();
  });

  test('should not track event with incompatible complex data', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('hello', { truthy: true }));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toBeFalsy();
  });

  test('should not track event with invalid name', async () => {
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent(123));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toBeFalsy();
  });
});
