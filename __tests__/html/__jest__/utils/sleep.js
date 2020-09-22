function sleep(durationInMS = 1000) {
  return new Promise(resolve => setTimeout(resolve, durationInMS));
}

function timeout(durationInMS, message = 'timeout') {
  return sleep(durationInMS).then(() => {
    throw new Error(message);
  });
}

module.exports = sleep;
module.exports.timeout = timeout;
