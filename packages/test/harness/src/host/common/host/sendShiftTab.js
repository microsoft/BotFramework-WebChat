const { Key } = require('selenium-webdriver');

module.exports = webDriver => {
  return function sendShiftTab(count = 1) {
    if (!(count >= 1 && count <= 100)) {
      throw new Error('First argument passed to sendShiftTab() must between 1 and 100.');
    }

    let actions = webDriver.actions().keyDown(Key.SHIFT);

    while (count--) {
      actions = actions.sendKeys(Key.TAB);
    }

    return actions.keyUp(Key.SHIFT).perform();
  };
};
