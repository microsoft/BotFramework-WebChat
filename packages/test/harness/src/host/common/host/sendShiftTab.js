const { Key } = require('selenium-webdriver');

module.exports = webDriver => {
  return function sendShiftTab() {
    return webDriver.actions().keyDown(Key.SHIFT).sendKeys(Key.TAB).keyUp(Key.SHIFT).perform();
  };
};
