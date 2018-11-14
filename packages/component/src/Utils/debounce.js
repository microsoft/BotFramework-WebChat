function setTimeoutOrSync(fn, ms) {
  if (ms > 0) {
    return setTimeout(fn, ms);
  } else {
    fn();
  }
}

export default function (fn, ms = 1000) {
  let scheduled;
  let lastCall = 0;
  let nextArguments;

  return function () {
    nextArguments = arguments;

    if (!scheduled) {
      scheduled = setTimeoutOrSync(() => {
        lastCall = Date.now();
        fn.apply(null, nextArguments);
        scheduled = null;
      }, lastCall + ms - Date.now());
    }
  };
}
