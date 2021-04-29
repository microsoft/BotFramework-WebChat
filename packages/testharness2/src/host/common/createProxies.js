const createHostProxy = require('../../common/proxies/host');
const createWebDriverProxy = require('../../common/proxies/webDriverProxy');

module.exports = function createProxies(driver) {
  return {
    host: createHostProxy(driver),
    webDriverProxy: createWebDriverProxy(driver)
  };
};
