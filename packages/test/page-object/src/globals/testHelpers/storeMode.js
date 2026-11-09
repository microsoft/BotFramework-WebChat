// The provider set that Web Chat runs on in an html2 test: "redux" (today's, the default) or "default" (no Redux,
// internal and for tests only until it is complete).
//
// - A page declares it with `<meta name="webchat-test-store-mode" content="default" />`.
// - Otherwise, the runner sets it for every page from `WEBCHAT_TEST_STORE_MODE`, as the "webchat-test-store-mode"
//   parameter of the URL fragment.
//
// The helpers follow it: `createStore()` returns no store in default mode. The page applies it to Web Chat with the
// internal switch, `__INTERNAL_DO_NOT_USE__setDefaultModeEnabled()` of `botframework-webchat-api/internal.js`.

const STORE_MODES = Object.freeze(['default', 'redux']);

/**
 * Thrown by the helpers when a test needs the Redux store (initial state, store middleware, dispatch, state or action
 * history) in default mode.
 */
export class ReduxOnlyTest extends Error {
  constructor(message) {
    super(message);

    this.name = 'ReduxOnlyTest';
  }
}

export default function getStoreMode() {
  const mode =
    document.querySelector('meta[name="webchat-test-store-mode"]')?.getAttribute('content') ||
    new URLSearchParams(location.hash.replace(/^#/u, '')).get('webchat-test-store-mode') ||
    'redux';

  if (!STORE_MODES.includes(mode)) {
    throw new Error(`WebChatTest: Unknown store mode "${mode}", must be one of: ${STORE_MODES.join(', ')}.`);
  }

  return mode;
}
