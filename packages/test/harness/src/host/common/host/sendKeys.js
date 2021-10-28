const { Key } = require('selenium-webdriver');

module.exports = webDriver =>
  function sendKeys(...keys) {
    return keys.reduce((actions, key) => actions.sendKeys(Key[key] || key), webDriver.actions()).perform();
  };
