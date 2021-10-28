const getBrowserLogs = require('../getBrowserLogs');

module.exports = webDriver =>
  function getLogs() {
    return getBrowserLogs(webDriver);
  };
