module.exports = function setAsyncInterval(fn, interval, signal) {
  const once = async () => {
    if (signal.aborted) {
      return;
    }

    try {
      await fn();
    } catch (err) {
      throw err;
    }

    schedule();
  };

  const schedule = () => {
    if (!signal.aborted) {
      setTimeout(once, interval);
    }
  };

  schedule();
};
