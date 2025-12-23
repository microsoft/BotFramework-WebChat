const withResolvers = require('core-js-pure/features/promise/with-resolvers');

const checkAccessibility = require('./checkAccessibility');
const click = require('./click');
const clickAt = require('./clickAt');
const done = require('./done');
const dragAndHold = require('./dragAndHold');
const error = require('./error');
const executeScriptInFrame = require('./executeScriptInFrame');
const getLogs = require('./getLogs');
const hover = require('./hover');
const moveTo = require('./moveTo');
const pressAndHold = require('./pressAndHold');
const ready = require('./ready');
const release = require('./release');
const sendAccessKey = require('./sendAccessKey');
const sendDevToolsCommand = require('./sendDevToolsCommand');
const sendKeys = require('./sendKeys');
const sendShiftTab = require('./sendShiftTab');
const sendTab = require('./sendTab');
const snapshot = require('./snapshot');
const upload = require('./upload');
const windowSize = require('./windowSize');

/** RPC object on the Jest side. */
module.exports = function createHost(webDriver) {
  const doneWithResolvers = withResolvers();
  const readyWithResolvers = withResolvers();

  // Modifying this map will also requires modifying the corresponding RPC dummy at /src/browser/proxies/host.js
  return {
    checkAccessibility: checkAccessibility(webDriver),
    click: click(),
    clickAt: clickAt(webDriver),
    done: done(webDriver, doneWithResolvers.resolve),
    donePromise: doneWithResolvers.promise,
    dragAndHold: dragAndHold(webDriver),
    error: error(doneWithResolvers.reject),
    executeScriptInFrame: executeScriptInFrame(webDriver),
    getLogs: getLogs(webDriver),
    hover: hover(webDriver),
    moveTo: moveTo(webDriver),
    pressAndHold: pressAndHold(webDriver),
    ready: ready(readyWithResolvers.resolve),
    readyPromise: readyWithResolvers.promise,
    release: release(webDriver),
    sendAccessKey: sendAccessKey(webDriver),
    sendDevToolsCommand: sendDevToolsCommand(webDriver),
    sendKeys: sendKeys(webDriver),
    sendShiftTab: sendShiftTab(webDriver),
    sendTab: sendTab(webDriver),
    snapshot: snapshot(webDriver),
    upload: upload(webDriver),
    windowSize: windowSize(webDriver)
  };
};
