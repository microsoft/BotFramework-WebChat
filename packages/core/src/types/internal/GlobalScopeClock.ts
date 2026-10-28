import { type TypeOfGlobal } from '@msinternal/botframework-webchat-base/utils';

export type GlobalScopeClock = {
  // eslint-disable-next-line no-restricted-globals
  cancelAnimationFrame?: typeof cancelAnimationFrame | undefined;
  // eslint-disable-next-line no-restricted-globals
  cancelIdleCallback?: typeof cancelIdleCallback | undefined;
  // `setImmediate` and `clearImmediate` are Node.js globals, not in TypeScript's DOM library.
  clearImmediate?: TypeOfGlobal<'clearImmediate'> | undefined;
  // eslint-disable-next-line no-restricted-globals
  clearInterval?: typeof clearInterval | undefined;
  // eslint-disable-next-line no-restricted-globals
  clearTimeout?: typeof clearTimeout | undefined;
  // eslint-disable-next-line no-restricted-globals
  Date: typeof Date;
  // eslint-disable-next-line no-restricted-globals
  requestAnimationFrame?: typeof requestAnimationFrame | undefined;
  // eslint-disable-next-line no-restricted-globals
  requestIdleCallback?: typeof requestIdleCallback | undefined;
  setImmediate?: TypeOfGlobal<'setImmediate'> | undefined;
  // eslint-disable-next-line no-restricted-globals
  setInterval?: typeof setInterval | undefined;
  // eslint-disable-next-line no-restricted-globals
  setTimeout?: typeof setTimeout | undefined;
};
