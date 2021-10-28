const { Key } = require('selenium-webdriver');

const isForbiddenPropertyName = require('../../../common/utils/isForbiddenPropertyName');

module.exports = webDriver =>
  function sendKeys(...keys) {
    return keys
      .reduce(
        // Mitigated through whitelisting.
        // eslint-disable-next-line security/detect-object-injection
        (actions, key) => actions.sendKeys((!isForbiddenPropertyName(key) && Key[key]) || key),
        webDriver.actions()
      )
      .perform();
  };
