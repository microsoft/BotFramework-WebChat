const signalToReject = require('./signalToReject');

module.exports = function sleep(duration = 1000, signal) {
  return Promise.race([new Promise(resolve => setTimeout(resolve, duration)), signalToReject(signal)]);
};
