const createHost = require('./host/index');

module.exports = function createProxies(driver) {
  return {
    host: createHost(driver)
  };
};
