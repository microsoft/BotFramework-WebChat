const { join, relative } = require('path');

const allImagesCompleted = require('../allImagesCompleted');
const checkAccessibilty = require('./checkAccessibility');
const takeStabilizedScreenshot = require('../takeStabilizedScreenshot');

const testRoot = join(__dirname, '../../../../../../../__tests__/html/');

module.exports = webDriver =>
  async function snapshot(mode, options) {
    await allImagesCompleted(webDriver);

    const screenshot = await takeStabilizedScreenshot(webDriver);

    expect(screenshot).toMatchImageSnapshot(
      mode === 'local'
        ? {
            customDiffDir: testRoot,
            customSnapshotIdentifier: ({ counter, testPath }) => `${relative(testRoot, testPath)}.snap-${counter}`,
            customSnapshotsDir: testRoot
          }
        : {
            // jest-image-snapshot does not support <rootDir>.
            customSnapshotsDir: join(__dirname, '../../../../../../../__tests__/__image_snapshots__/html/')
          }
    );

    if (!options?.skipCheckAccessibility) {
      await checkAccessibilty(webDriver)();
    }
  };
