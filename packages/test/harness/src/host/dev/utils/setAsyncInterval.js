// This is similar to setInterval:
// - Instead of using a strict and sync interval, it will wait for X milliseconds AFTER the last async resolution;
// - Instead of clearAsyncInterval, we will use AbortController instead.

module.exports = function setAsyncInterval(fn, interval, signal) {
  const once = async () => {
    if (signal.aborted) {
      return;
    }

    await fn();

    schedule();
  };

  const schedule = () => {
    if (!signal.aborted) {
      setTimeout(once, interval);
    }
  };

  schedule();
};
