const { join } = require('path');
const sleep = require('../../../common/utils/sleep');

const TIME_FOR_IMAGE_COMPLETE = 5000;

module.exports = webDriver =>
  async function snapshot() {
    // Wait until all images are loaded/errored.
    for (const start = Date.now(); Date.now() - start < TIME_FOR_IMAGE_COMPLETE; ) {
      if (
        await webDriver.executeScript(() =>
          [].every.call(document.getElementsByTagName('img'), ({ complete }) => complete)
        )
      ) {
        break;
      }

      sleep(100);
    }

    await expect(webDriver.takeScreenshot()).resolves.toMatchImageSnapshot({
      // jest-image-snapshot does not support <rootDir>.
      customSnapshotsDir: join(__dirname, '../../../../../../../__tests__/__image_snapshots__/html/')
    });
  };
