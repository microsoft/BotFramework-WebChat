// The provider set that Web Chat runs on in an html2 test: "redux" (today's, the default) or "default" (no Redux,
// internal and for tests only until it is complete).
//
// - A page declares it with `<meta name="webchat-test-store-mode" content="default" />`.
// - Otherwise, the runner sets it for every page from `WEBCHAT_TEST_STORE_MODE`, as the "webchat-test-store-mode"
//   parameter of the URL fragment, and as a cookie of the same name (kept when a page redirects to another fragment).
//
// The helpers follow it: `createStore()` returns no store in default mode. The page-object applies it to Web Chat when
// `window.WebChat` is set (the UMD bundles, and `/assets/esm/test.js`), with the internal switch
// `WebChat.internal.__INTERNAL_DO_NOT_USE__setDefaultModeEnabled()`. In default mode, the runner fails a test if Web
// Chat mounted the Redux providers, or never mounted the default providers.

const STORE_MODES = Object.freeze(['default', 'redux']);
const STORE_MODE_NAME = 'webchat-test-store-mode';

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

function getStoreModeFromCookie() {
  const entry = document.cookie.split('; ').find(entry => entry.startsWith(`${STORE_MODE_NAME}=`));

  return entry && decodeURIComponent(entry.substring(STORE_MODE_NAME.length + 1));
}

export default function getStoreMode() {
  const mode =
    document.querySelector(`meta[name="${STORE_MODE_NAME}"]`)?.getAttribute('content') ||
    new URLSearchParams(location.hash.replace(/^#/u, '')).get(STORE_MODE_NAME) ||
    getStoreModeFromCookie() ||
    'redux';

  if (!STORE_MODES.includes(mode)) {
    throw new Error(`WebChatTest: Unknown store mode "${mode}", must be one of: ${STORE_MODES.join(', ')}.`);
  }

  return mode;
}

/**
 * The internal entry of Web Chat on the page: registered by an ESM page (`registerWebChatInternal()`), or
 * `window.WebChat.internal` of the bundles.
 */
export function getWebChatInternal() {
  return window.__WEBCHAT_TEST_INTERNAL__ || window.WebChat?.internal;
}

/** The test handle of the default providers connected to the Direct Line, if any (reads, and posts as the emulator). */
export function getTestHandle(directLine) {
  return getWebChatInternal()?.__INTERNAL_DO_NOT_USE__getTestHandle?.(directLine);
}

function applyStoreMode(internal) {
  const setDefaultModeEnabled = internal?.__INTERNAL_DO_NOT_USE__setDefaultModeEnabled;

  // Without the switch (e.g. an older bundle), Web Chat runs on Redux: in default mode, the runner fails the test.
  typeof setDefaultModeEnabled === 'function' && setDefaultModeEnabled(getStoreMode() === 'default');
}

/**
 * For ESM pages that import `botframework-webchat-api/internal.js` (or the bundle's internal entry) themselves: applies
 * the store mode to it, and lets the runner read its provider mount counts.
 */
export function registerWebChatInternal(internal) {
  window.__WEBCHAT_TEST_INTERNAL__ = internal;

  applyStoreMode(internal);
}

/**
 * Applies the store mode to Web Chat as soon as `window.WebChat` is set, before the page renders it. Called once, when
 * the page-object loads.
 */
export function installStoreMode() {
  let webChat = window.WebChat;

  webChat && applyStoreMode(webChat.internal);

  Object.defineProperty(window, 'WebChat', {
    configurable: true,
    enumerable: true,
    get: () => webChat,
    set: value => {
      webChat = value;

      // Each bundle sets `window.WebChat` with its own internal entry.
      applyStoreMode(value?.internal);
    }
  });

  // An ESM page that imports "botframework-webchat" through its import map, and sets `window.WebChat` for the helpers
  // without the internal entry: the internal entry of the same module. The page's own imports load it first, and
  // `run()` talks to the host before calling the test, so it is registered before Web Chat renders (if not, the runner
  // fails the test: the Redux providers mounted). Not a literal, so the bundler leaves it to the browser.
  let importMap;

  try {
    importMap = JSON.parse(document.querySelector('script[type="importmap"]')?.textContent || '{}');
  } catch {
    importMap = {};
  }

  if (importMap.imports?.['botframework-webchat']) {
    const specifier = 'botframework-webchat';

    import(/* webpackIgnore: true */ specifier)
      .then(({ internal }) => internal && !window.__WEBCHAT_TEST_INTERNAL__ && registerWebChatInternal(internal))
      .catch(() => undefined);
  }
}
