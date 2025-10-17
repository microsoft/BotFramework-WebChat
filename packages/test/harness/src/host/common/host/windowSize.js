module.exports = (/** @type import('selenium-webdriver').WebDriver */ webDriver) =>
  async function windowSize(width, height, element) {
    const rect = await webDriver.manage().window().getRect();

    height = +height || rect.height;
    width = +width || rect.width;

    // TODO: [P2] We cannot run --headless mode reliably, setting window size will mess things up.
    //            Look at /packages/test/harness/src/host/jest/allocateWebDriver.js.
    // await webDriver.manage().window().setRect({ height, width });

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
  };
