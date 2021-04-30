module.exports = function (webDriver) {
  return async () => {
    /* istanbul ignore next */
    await webDriver.executeScript(
      (message, url) => {
        console.groupCollapsed(message);
        console.log(url);
        console.groupEnd();
      },
      '[TESTHARNESS] Snapshot taken.',
      `data:image/png;base64,${await webDriver.takeScreenshot()}`
    );
  };
};
