const { join } = require('path') || {};
const { Key, logging } = require('selenium-webdriver') || {};
const createDeferred = require('p-defer');

const IGNORE_CONSOLE_MESSAGE_FRAGMENTS = [
  '[TESTHARNESS]',
  'favicon.ico',
  'in-browser Babel transformer',
  'react-devtools'
];

function formatLogEntries(entries) {
  return entries
    .map(({ level: { name }, message }) => `📃 [${name}] ${message.split(' ').slice(2).join(' ')}`)
    .join('\n');
}

function isDeprecation(message) {
  return message.includes('deprecate');
}

module.exports = function createHost(webDriver) {
  const completion = createDeferred();
  const ready = createDeferred();
  let logs = [];

  const getLogs = async () => {
    logs = [
      ...logs,
      ...(await webDriver.manage().logs().get(logging.Type.BROWSER)).filter(
        // Ignore console entries that contains specified fragments.
        ({ message }) =>
          !IGNORE_CONSOLE_MESSAGE_FRAGMENTS.some(ignoreFragment =>
            ignoreFragment instanceof RegExp ? ignoreFragment.test(message) : ~message.indexOf(ignoreFragment)
          )
      )
    ];

    return logs;
  };

  const dumpLogs = async () => {
    if (process.env.CI) {
      return;
    }

    const logs = await getLogs();

    logs.length && console.log(formatLogEntries(logs));
  };

  return {
    click: element => element.click(),
    done: async ({ expectDeprecations = false, ignoreErrors = false } = {}) => {
      const entries = await getLogs();

      if (expectDeprecations) {
        expect(entries.some(({ message }) => isDeprecation(message))).toBeTruthy();
      }

      // Check if there are any console.error.
      if (!ignoreErrors && logging) {
        expect(entries.filter(({ level }) => level === logging.Level.SEVERE)).toHaveLength(0);
      }

      // Dump all logs to console if we are not in CI.
      await dumpLogs();

      // Clear out logs, readying for next session.
      logs = [];

      completion.resolve();
    },
    donePromise: completion.promise,
    error: async error => {
      // Dump all logs to console if we are not in CI.
      await dumpLogs();

      // Clear out logs, readying for next session.
      logs = [];

      completion.reject(error);
    },
    getLogs,
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
      await webDriver.manage().window().setRect({ height, width });

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
