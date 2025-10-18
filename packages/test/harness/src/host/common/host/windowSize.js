const { ADJUST_WINDOW_SIZE_HEIGHT } = require('../constants');

module.exports = (/** @type import('selenium-webdriver').WebDriver */ webDriver) =>
  async function windowSize(width, height, element) {
    const rect = await webDriver.manage().window().getRect();

    height = +height || rect.height;
    width = +width || rect.width;

    await webDriver
      .manage()
      .window()
      .setRect({ height: +height + ADJUST_WINDOW_SIZE_HEIGHT || rect.height, width });

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
