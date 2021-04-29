module.exports = function createWebDriverProxy(driver) {
  return {
    click: element => element.click(),
    sendKeys: async (...keys) => {
      await driver
        .actions()
        .sendKeys(...keys)
        .perform();
    },
    takeScreenshot: () => driver.takeScreenshot()
  };
};
