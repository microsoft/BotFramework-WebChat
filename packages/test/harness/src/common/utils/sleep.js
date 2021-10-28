const signalToReject = require('./signalToReject');

// eslint-disable-next-line no-magic-numbers
module.exports = function sleep(duration = 1000, signal) {
  return Promise.race([new Promise(resolve => setTimeout(resolve, duration)), signalToReject(signal)]);
};
