const { Origin } = require('selenium-webdriver');

function isZeroOrPositive(value) {
  // This will handle minus-zero.
  return 1 / value >= 0;
}

module.exports = webDriver => {
  return async function click(x, y, element) {
    if (element) {
      const { offsetHeight, offsetWidth, pageX, pageY } = await webDriver.executeScript(element => {
        const { offsetHeight, offsetWidth } = element;
        const { x: pageX, y: pageY } = element.getClientRects()[0];

        return { offsetHeight, offsetWidth, pageX, pageY };
      }, element);

      if (!isZeroOrPositive(x)) {
        x += offsetWidth;
      }

      if (!isZeroOrPositive(y)) {
        y += offsetHeight;
      }

      x += pageX;
      y += pageY;
    }

    webDriver
      .actions()
      .move({ origin: Origin.VIEWPORT, x: ~~x, y: ~~y })
      .click()
      .perform();
  };
};
