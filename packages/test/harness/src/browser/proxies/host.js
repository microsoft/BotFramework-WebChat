/* eslint no-empty-function: "off" */

/** RPC object on the browser side. */
export default function createHost() {
  // Modifying this map will also requires modifying the corresponding RPC dummy at /src/host/common/host/index.js.
  // Since Jest does not need to call the browser, it can use executeScript() instead. All implementations here are dummy implementations.
  return {
    click: () => {},
    done: () => {},
    donePromise: () => {},
    error: () => {},
    getLogs: () => {},
    ready: () => {},
    readyPromise: () => {},
    sendAccessKey: () => {},
    sendKeys: () => {},
    sendShiftTab: () => {},
    sendTab: () => {},
    snapshot: () => {},
    windowSize: () => {}
  };
}
