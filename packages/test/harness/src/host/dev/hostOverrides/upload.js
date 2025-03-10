const { join, win32 } = require('path');

module.exports = webDriver => async (element, filename) => {
  let path = join(process.cwd(), '__tests__/html/assets/uploads/', filename);

  const { WSL_DISTRO_NAME } = process.env;

  // If running under WSL2, Chrome is running under Windows and we should use UNC for the assets.
  if (WSL_DISTRO_NAME) {
    path = win32.join('\\\\wsl$', WSL_DISTRO_NAME, path);
  }

  await webDriver.executeScript(path => {
    console.log(`Uploading file "${path}".`);
  }, path);

  return element.sendKeys(path);
};
