import sleep from '../../utils/sleep';

const CHECK_INTERVAL = 100;

export default async function became(message, fn, timeout) {
  if (typeof timeout !== 'number') {
    throw new Error('"timeout" argument must be set.');
  }

  for (const start = Date.now(); Date.now() < start + timeout; ) {
    if (await fn()) {
      return;
    }

    await sleep(CHECK_INTERVAL);
  }

  throw new Error(`Timed out while waiting for page condition "${message}" after ${timeout / 1000} seconds.`);
}
