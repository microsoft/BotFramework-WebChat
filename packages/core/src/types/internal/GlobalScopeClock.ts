export type GlobalScopeClock = {
  // eslint-disable-next-line no-restricted-globals
  cancelAnimationFrame?: typeof cancelAnimationFrame;
  // eslint-disable-next-line no-restricted-globals
  cancelIdleCallback?: typeof cancelIdleCallback;
  // eslint-disable-next-line no-restricted-globals
  clearImmediate?: typeof clearImmediate;
  // eslint-disable-next-line no-restricted-globals
  clearInterval: typeof clearInterval;
  // eslint-disable-next-line no-restricted-globals
  clearTimeout: typeof clearTimeout;
  // eslint-disable-next-line no-restricted-globals
  Date: typeof Date;
  // eslint-disable-next-line no-restricted-globals
  requestAnimationFrame?: typeof requestAnimationFrame;
  // eslint-disable-next-line no-restricted-globals
  requestIdleCallback?: typeof requestIdleCallback;
  // eslint-disable-next-line no-restricted-globals
  setImmediate?: typeof setImmediate;
  // eslint-disable-next-line no-restricted-globals
  setInterval: typeof setInterval;
  // eslint-disable-next-line no-restricted-globals
  setTimeout: typeof setTimeout;
};
