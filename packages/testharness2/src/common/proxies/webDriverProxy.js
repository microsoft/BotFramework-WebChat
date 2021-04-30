const { Key } = require("selenium-webdriver");

module.exports = function createWebDriverProxy(driver) {
  return {
    takeScreenshot: () => driver.takeScreenshot()
  };
};
