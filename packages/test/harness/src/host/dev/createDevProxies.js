const createProxies = require('../common/createProxies');
const done = require('./hostOverrides/done');
const error = require('./hostOverrides/error');
const snapshot = require('./hostOverrides/snapshot');
const upload = require('./hostOverrides/upload');
const windowSize = require('./hostOverrides/windowSize');

module.exports = function createDevProxies(webDriver) {
  const { host, ...proxies } = createProxies(webDriver);

  return {
    host: {
      ...host,
      done: done(webDriver, host.done),
      error: error(webDriver, host.error),
      snapshot: snapshot(webDriver, host.snapshot),
      upload: upload(webDriver),
      windowSize: windowSize(webDriver, host.windowSize)
    },
    ...proxies
  };
};
