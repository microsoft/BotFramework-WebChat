module.exports = function (webDriver) {
  return async () => {
    /* istanbul ignore next */
    await webDriver.executeScript(
      (message, url) => {
        console.log(message);
        console.log(url);
      },
      '[TESTHARNESS] Snapshot taken.',
      `data:image/png;base64,${await webDriver.takeScreenshot()}`
    );
  };
};
