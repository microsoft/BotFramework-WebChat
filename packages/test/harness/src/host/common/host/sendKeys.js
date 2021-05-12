const { Key } = require('selenium-webdriver');

module.exports = webDriver => {
  return function sendKeys(...keys) {
    return keys.reduce((actions, key) => actions.sendKeys(Key[key] || key), webDriver.actions()).perform();
  };
};
