// In dev mode, we output the screenshot in console instead of checking against a PNG file.

module.exports = webDriver =>
  async function snapshot() {
    const base64 = await webDriver.takeScreenshot();

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
