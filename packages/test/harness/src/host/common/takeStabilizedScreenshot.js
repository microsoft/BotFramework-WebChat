const { waitFor } = require('@testduet/wait-for');

const TIME_FOR_STABILIZED_SCREENSHOT = 5000; // Time (in ms) to wait for a stabilized screenshot.
const NUM_STABILIZED_SCREENSHOT = 5;

// Keep taking screenshot until 2 consecutive screenshots are the same.
module.exports = async function takeStabilizedScreenshot(
  /** @type import('selenium-webdriver').WebDriver */ webDriver
) {
  let buckets = [];

  await waitFor(
    async () => {
      const screenshot = await webDriver.takeScreenshot();

      buckets.push(screenshot);
      buckets = buckets.slice(0, NUM_STABILIZED_SCREENSHOT);

      if (buckets.length < NUM_STABILIZED_SCREENSHOT) {
        throw new Error(
          `Not enough screenshots to signal stability, need ${NUM_STABILIZED_SCREENSHOT}, got ${buckets.length}`
        );
      } else if (!buckets.slice(1).every(value => value === buckets[0])) {
        throw new Error('Screenshots are not stable');
      }
    },
    { timeout: TIME_FOR_STABILIZED_SCREENSHOT }
  );

  return buckets[0];
};
