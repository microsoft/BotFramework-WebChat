const { By } = require('selenium-webdriver');

const until = require('./until');

const TIME_FOR_STABILIZED_SCREENSHOT = 5000; // Time (in ms) to wait for a stabilized screenshot.

// Keep taking screenshot until 2 consecutive screenshots are the same.
module.exports = async function takeStabilizedScreenshot(
  /** @type import('selenium-webdriver').WebDriver */ webDriver
) {
  let lastScreenshot;

  const screenshot = await until(async () => {
    // TODO: [P1] --headless is not quite working.
    //            Headless is supposed to be chrome-less (no window border).
    //            After we set webDriver.manage().window().size(1024, 768), webDriver.takeScreenshot() is not returning a 1024x768 image.
    //            See /packages/test/harness/src/host/jest/allocateWebDriver.js.
    const element = await webDriver.findElement(By.id('webchat'));
    const screenshot = await element.takeScreenshot();

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
