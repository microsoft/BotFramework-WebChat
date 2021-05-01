module.exports = function (webDriver) {
  return async () => {
    const element = await webDriver.executeScript(() => document.getElementById('webchat'));
    const base64 = await element.takeScreenshot();

    /* istanbul ignore next */
    await webDriver.executeScript(
      (message, url) => {
        console.groupCollapsed(message);
        console.log(url);
        console.groupEnd();
      },
      '[TESTHARNESS] Snapshot taken.',
      `data:image/png;base64,${base64}`
    );
  };
};
