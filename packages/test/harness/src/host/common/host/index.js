const createDeferred = require('p-defer-es5');

const click = require('./click');
const clickAt = require('./clickAt');
const done = require('./done');
const error = require('./error');
const getLogs = require('./getLogs');
const hover = require('./hover');
const moveTo = require('./moveTo');
const pressAndHold = require('./pressAndHold');
const ready = require('./ready');
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
  const doneDeferred = createDeferred();
  const readyDeferred = createDeferred();

  // Modifying this map will also requires modifying the corresponding RPC dummy at /src/browser/proxies/host.js
  return {
    click: click(),
    clickAt: clickAt(webDriver),
    done: done(webDriver, doneDeferred.resolve),
    donePromise: doneDeferred.promise,
    error: error(doneDeferred.reject),
    getLogs: getLogs(webDriver),
    hover: hover(webDriver),
    moveTo: moveTo(webDriver),
    pressAndHold: pressAndHold(webDriver),
    ready: ready(readyDeferred.resolve),
    readyPromise: readyDeferred.promise,
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
