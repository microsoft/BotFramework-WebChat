const { Key } = require('selenium-webdriver');

const isForbiddenPropertyName = require('../../../common/utils/isForbiddenPropertyName');

module.exports = webDriver =>
  function sendKeys(...keys) {
    return keys
      .reduce(
        // Mitigated through denylisting.
        // Since `selenium-webdriver/Key` is a TypeScript interface and is not accessible via JavaScript (e.g. TypeScript enum),
        // thus, we cannot use allowlisting approach.
        // eslint-disable-next-line security/detect-object-injection
        (actions, key) => actions.sendKeys((!isForbiddenPropertyName(key) && Key[key]) || key),
        webDriver.actions()
      )
      .perform();
  };
