// This is similar to setInterval:
// - Instead of using a strict and sync interval, it will wait for X milliseconds AFTER the last async resolution;
// - Instead of clearAsyncInterval, we will use AbortController instead.

module.exports = function setAsyncInterval(fn, interval, signal) {
  // This conflicts with "@typescript-eslint/no-use-before-define".
  // eslint-disable-next-line prefer-const
  let schedule;

  const once = async () => {
    if (signal.aborted) {
      return;
    }

    await fn();

    schedule();
  };

  schedule = () => {
    if (!signal.aborted) {
      setTimeout(once, interval);
    }
  };

  schedule();
};
