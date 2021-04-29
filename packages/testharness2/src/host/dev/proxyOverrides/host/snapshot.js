module.exports = function (webDriver) {
  return async () => {
    /* istanbul ignore next */
    await webDriver.executeScript(message => {
      console.log(message);
    }, `[TESTHARNESS] Snapshot taken.\n\ndata:image/png;base64,${await webDriver.takeScreenshot()}`);
  };
};
