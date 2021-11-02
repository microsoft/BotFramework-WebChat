const sleep = require('../../common/utils/sleep');

const SINGLE_FRAME_TIME = 17; // Assumes we are on 60 Hz display.

module.exports = async function until(fn, timeout) {
  let result;

  for (const start = Date.now(); Date.now() - start < timeout; ) {
    // This is a process loop and await inside loops are intentional.
    // eslint-disable-next-line no-await-in-loop
    result = await fn();

    if (result) {
      break;
    }

    // This is a process loop and await inside loops are intentional.
    // eslint-disable-next-line no-await-in-loop
    await sleep(SINGLE_FRAME_TIME);
  }

  return result;
};
