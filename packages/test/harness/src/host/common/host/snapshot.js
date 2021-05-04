const { join } = require('path');

module.exports = webDriver => {
  return function snapshot() {
    expect(webDriver.takeScreenshot()).resolves.toMatchImageSnapshot({
      customSnapshotsDir: join(__dirname, '../../../../../../../__tests__/__image_snapshots__/html/')
    });
  };
};
