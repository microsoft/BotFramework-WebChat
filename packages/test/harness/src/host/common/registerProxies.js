const createHostBridge = require('./createHostBridge');
const rpc = require('../../common/rpc');

/** Registers a map of proxy, which the HTML test can send RPC calls. */
module.exports = function registerProxies(webDriver, proxies) {
  const bridge = createHostBridge(webDriver);

  Object.entries(proxies).forEach(([name, proxy]) => rpc(name, proxy, [bridge, bridge.browser]));

  return bridge;
};
