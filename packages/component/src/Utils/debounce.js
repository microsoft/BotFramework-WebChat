const DEFAULT_DEBOUNCE_INTERVAL = 1000;

function setTimeoutOrSync(fn, ms) {
  if (ms > 0) {
    return setTimeout(fn, ms);
  }

  fn();
}

export default function (fn, ms = DEFAULT_DEBOUNCE_INTERVAL) {
  let scheduled;
  let lastCall = 0;
  let nextArguments;

  return function (...args) {
    nextArguments = args;

    if (!scheduled) {
      scheduled = setTimeoutOrSync(() => {
        lastCall = Date.now();
        fn(...nextArguments);
        scheduled = null;
      }, lastCall + ms - Date.now());
    }
  };
}
