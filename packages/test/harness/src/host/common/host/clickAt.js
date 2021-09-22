const { Origin } = require('selenium-webdriver');

const clientOffsetToViewportOffset = require('./util/clientOffsetToViewportOffset');

module.exports = webDriver => {
  return async function click(x, y, element) {
    ({ x, y } = await clientOffsetToViewportOffset(webDriver, element, x, y));

    await webDriver
      .actions()
      .move({ origin: Origin.VIEWPORT, x: ~~x, y: ~~y })
      .click()
      .perform();
  };
};
