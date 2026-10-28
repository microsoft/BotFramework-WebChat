import type { StoreEnhancer } from 'redux';

// For adding things to `globalThis`, TypeScript need `var`, not `const` or `let`.
/* eslint-disable no-var */
declare global {
  const clearImmediate: ((timeout: number) => void) | undefined;
  const setImmediate: ((fn: () => void) => number) | undefined;

  var WEB_CHAT_BUILD_INFO_BUILD_TOOL: string | undefined;
  var WEB_CHAT_BUILD_INFO_MODULE_FORMAT: string | undefined;
  var WEB_CHAT_BUILD_INFO_VERSION: string | undefined;

  // Set by the Redux DevTools browser extension.
  var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: ((enhancer: StoreEnhancer) => StoreEnhancer) | undefined;
}

export {};
