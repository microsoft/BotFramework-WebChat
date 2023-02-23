const allImagesCompleted = require('../../common/allImagesCompleted');
const checkAccessibility = require('../../common/host/checkAccessibility');
const takeStabilizedScreenshot = require('../../common/takeStabilizedScreenshot');

// In dev mode, we output the screenshot in console instead of checking against a PNG file.

module.exports = webDriver =>
  async function snapshot() {
    await allImagesCompleted(webDriver);

    const base64 = await takeStabilizedScreenshot(webDriver);

    /* istanbul ignore next */
    await webDriver.executeAsyncScript(
      (message, base64, callback) => {
        (async function () {
          // "imageAsLog" is from /src/browser/globals/imageAsLog.
          // eslint-disable-next-line no-undef, no-magic-numbers
          const log = await imageAsLog(base64, 0.5);

          console.group(message);
          console.log(...log);
          console.groupEnd();

          callback();
        })();
      },
      '[TESTHARNESS] Snapshot taken.',
      base64
    );

    await checkAccessibility(webDriver)();
  };
