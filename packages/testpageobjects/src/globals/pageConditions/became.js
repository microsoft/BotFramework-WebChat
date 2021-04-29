import sleep from '../../utils/sleep';

const CHECK_INTERVAL = 100;

export default async function became(message, fn, timeout) {
  for (const start = Date.now(); Date.now() < start + timeout; ) {
    if (fn()) {
      return;
    }

    await sleep(CHECK_INTERVAL);
  }

  throw new Error(`Timed out while waiting for page condition "${message}".`);
}
