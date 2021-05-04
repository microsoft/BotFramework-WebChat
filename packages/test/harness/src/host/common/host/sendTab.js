const { Key } = require('selenium-webdriver');

module.exports = webDriver => {
  return function sendTab() {
    return webDriver.actions().sendKeys(Key.TAB).perform();
  };
};
