const createProxies = require('../common/createProxies');
const overrideDone = require('./proxyOverrides/host/done');
const overrideError = require('./proxyOverrides/host/error');
const overrideSnapshot = require('./proxyOverrides/host/snapshot');
const overrideWindowSize = require('./proxyOverrides/host/windowSize');

module.exports = function createDevProxies(webDriver) {
  const { host, ...proxies } = createProxies(webDriver);

  return {
    host: {
      ...host,
      done: overrideDone(webDriver, host.done),
      error: overrideError(webDriver, host.error),
      snapshot: overrideSnapshot(webDriver, host.snapshot),
      windowSize: overrideWindowSize(webDriver, host.windowSize)
    },
    ...proxies
  };
};
