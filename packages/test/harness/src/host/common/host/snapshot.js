const { join } = require('path');

const allImagesCompleted = require('../allImagesCompleted');
const checkAccessibilty = require('./checkAccessibility');
const takeStabilizedScreenshot = require('../takeStabilizedScreenshot');

module.exports = webDriver =>
  async function snapshot() {
    await allImagesCompleted(webDriver);

    const screenshot = await takeStabilizedScreenshot(webDriver);

    expect(screenshot).toMatchImageSnapshot({
      // jest-image-snapshot does not support <rootDir>.
      customSnapshotsDir: join(__dirname, '../../../../../../../__tests__/__image_snapshots__/html/')
    });

    await checkAccessibilty(webDriver)();
  };
