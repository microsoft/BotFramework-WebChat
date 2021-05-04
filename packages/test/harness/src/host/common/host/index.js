const createDeferred = require('p-defer');

const click = require('./click');
const done = require('./done');
const error = require('./error');
const getLogs = require('./getLogs');
const ready = require('./ready');
const sendAccessKey = require('./sendAccessKey');
const sendKeys = require('./sendKeys');
const sendShiftTab = require('./sendShiftTab');
const sendTab = require('./sendTab');
const snapshot = require('./snapshot');
const windowSize = require('./windowSize');

module.exports = function createHost(webDriver) {
  const doneDeferred = createDeferred();
  const readyDeferred = createDeferred();

  return {
    click: click(),
    done: done(webDriver, doneDeferred.resolve),
    donePromise: doneDeferred.promise,
    error: error(doneDeferred.reject),
    getLogs: getLogs(webDriver),
    ready: ready(readyDeferred.resolve),
    readyPromise: readyDeferred.promise,
    sendAccessKey: sendAccessKey(webDriver),
    sendKeys: sendKeys(webDriver),
    sendShiftTab: sendShiftTab(webDriver),
    sendTab: sendTab(webDriver),
    snapshot: snapshot(webDriver),
    windowSize: windowSize(webDriver)
  };
};
