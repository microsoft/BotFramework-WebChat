const until = require('./until');

const TIME_FOR_STABILIZED_SCREENSHOT = 5000; // Time (in ms) to wait for a stabilized screenshot.

// Keep taking screenshot until 2 consecutive screenshots are the same.
module.exports = async function takeStabilizedScreenshot(webDriver) {
  let lastScreenshot;

  const screenshot = await until(async () => {
    const screenshot = await webDriver.takeScreenshot();

    if (lastScreenshot === screenshot) {
      return screenshot;
    }

    lastScreenshot = screenshot;

    return false;
  }, TIME_FOR_STABILIZED_SCREENSHOT);

  if (!screenshot) {
    throw new Error(`No stabilized screenshot is taken after ${TIME_FOR_STABILIZED_SCREENSHOT} ms.`);
  }

  return screenshot;
};
