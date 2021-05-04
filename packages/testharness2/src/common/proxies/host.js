const { join } = require('path') || {};
const { Key, logging } = require('selenium-webdriver') || {};
const createDeferred = require('p-defer');
const getLogs = require('../../host/common/getLogs');

function isDeprecation(message) {
  return message.includes('deprecate');
}

module.exports = function createHost(webDriver) {
  const completion = createDeferred();
  const ready = createDeferred();
  let logs = [];

  return {
    click: element => element.click(),
    done: async ({ expectDeprecations = false, ignoreErrors = false } = {}) => {
      const entries = await getLogs(webDriver);

      if (expectDeprecations) {
        expect(entries.some(({ message }) => isDeprecation(message))).toBeTruthy();
      }

      // Check if there are any console.error.
      if (!ignoreErrors && logging) {
        expect(entries.filter(({ level }) => level === logging.Level.SEVERE)).toHaveLength(0);
      }

      // Clear out logs, readying for next session.
      logs = [];

      completion.resolve();
    },
    donePromise: completion.promise,
    error: async error => {
      // Clear out logs, readying for next session.
      logs = [];

      completion.reject(error);
    },
    getLogs: getLogs.bind(null, webDriver),
    ready: () => ready.resolve(),
    readyPromise: ready.promise,
    sendAccessKey: async key => {
      await webDriver
        .actions()
        .keyDown(Key.ALT)
        .keyDown(Key.SHIFT)
        .sendKeys(key)
        .keyUp(Key.SHIFT)
        .keyUp(Key.ALT)
        .perform();
    },
    sendKeys: async (...keys) => {
      await keys.reduce((actions, key) => actions.sendKeys(Key[key] || key), webDriver.actions()).perform();
    },
    sendShiftTab: async () => {
      await webDriver.actions().keyDown(Key.SHIFT).sendKeys(Key.TAB).keyUp(Key.SHIFT).perform();
    },
    sendTab: async () => {
      await webDriver.actions().sendKeys(Key.TAB).perform();
    },
    snapshot: () =>
      webDriver &&
      expect(webDriver.takeScreenshot()).resolves.toMatchImageSnapshot({
        customSnapshotsDir: join(__dirname, '../../../../../__tests__/__image_snapshots__/html/')
      }),
    windowSize: async (width, height, element) => {
      const rect = await webDriver.manage().window().getRect();

      height = +height || rect.height;
      width = +width || rect.width;

      await webDriver.manage().window().setRect({ height, width });

      /* istanbul ignore next */
      element &&
        (await webDriver.executeScript(
          (element, width, height) => {
            if (width) {
              element.style.width = width + 'px';
            }

            if (height) {
              element.style.height = height + 'px';
            }
          },
          element,
          width,
          height
        ));
    }
  };
};
