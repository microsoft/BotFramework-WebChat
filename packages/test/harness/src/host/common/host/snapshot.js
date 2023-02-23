/* global axe */

const { join } = require('path');

const allImagesCompleted = require('../allImagesCompleted');
const takeStabilizedScreenshot = require('../takeStabilizedScreenshot');

module.exports = webDriver =>
  async function snapshot() {
    await allImagesCompleted(webDriver);

    const screenshot = await takeStabilizedScreenshot(webDriver);

    expect(screenshot).toMatchImageSnapshot({
      // jest-image-snapshot does not support <rootDir>.
      customSnapshotsDir: join(__dirname, '../../../../../../../__tests__/__image_snapshots__/html/')
    });

    // TODO: [P1] Add a new host.checkAccessibilty() command.
    const results = await axe.run();

    if (results.violations.length) {
      console.log(results);

      throw new Error('Accessibility violations found.');
    }
  };
