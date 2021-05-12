const getBrowserLogs = require('../getBrowserLogs');

module.exports = webDriver => {
  return function getLogs() {
    return getBrowserLogs(webDriver);
  };
};
