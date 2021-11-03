const { Origin } = require('selenium-webdriver');

const clientOffsetToViewportOffset = require('./util/clientOffsetToViewportOffset');

module.exports = webDriver =>
  async function click(x, y, element) {
    ({ x, y } = await clientOffsetToViewportOffset(webDriver, element, x, y));

    await webDriver
      .actions()
      .move({ origin: Origin.VIEWPORT, x: ~~x, y: ~~y })
      .perform();
  };
