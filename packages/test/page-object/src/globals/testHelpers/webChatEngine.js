// The store that Web Chat runs on in an html2 test: "redux" (the default) or "webchat" (the Web Chat engine, internal
// and for tests only until it replaces the Redux store).
//
// - The runner sets it for every page from `WEBCHAT_TEST_ENGINE`, as the "webchat-test-engine" parameter of the URL
//   fragment, and as a cookie of the same name (kept when a page redirects to another fragment).
// - With "webchat", `createStore()` of the helpers creates the engine, and the page-object turns on the internal switch
//   `__INTERNAL_DO_NOT_USE__setWebChatEngineEnabled()` as soon as `window.WebChat` is set, so `<Composer>` without a
//   `store` creates the engine too. Pages that call `WebChat.createStore()` themselves stay on Redux.

const TEST_ENGINES = Object.freeze(['redux', 'webchat']);
const TEST_ENGINE_NAME = 'webchat-test-engine';

function getTestEngineFromCookie() {
  const entry = document.cookie.split('; ').find(entry => entry.startsWith(`${TEST_ENGINE_NAME}=`));

  return entry && decodeURIComponent(entry.substring(TEST_ENGINE_NAME.length + 1));
}

export default function getTestEngine() {
  const engine =
    new URLSearchParams(location.hash.replace(/^#/u, '')).get(TEST_ENGINE_NAME) || getTestEngineFromCookie() || 'redux';

  if (!TEST_ENGINES.includes(engine)) {
    throw new Error(`WebChatTest: Unknown engine "${engine}", must be one of: ${TEST_ENGINES.join(', ')}.`);
  }

  return engine;
}

/**
 * The internal entry of Web Chat on the page: `window.WebChat.internal` of the bundles, or the one of the module that an
 * ESM page imports through its import map.
 */
export function getWebChatInternal() {
  return window.__WEBCHAT_TEST_INTERNAL__ || window.WebChat?.internal;
}

function applyTestEngine(internal) {
  const setWebChatEngineEnabled = internal?.__INTERNAL_DO_NOT_USE__setWebChatEngineEnabled;

  // Without the switch (e.g. an older bundle), Web Chat runs on Redux: with "webchat", the runner fails the test.
  typeof setWebChatEngineEnabled === 'function' && setWebChatEngineEnabled(getTestEngine() === 'webchat');
}

/**
 * Applies the engine of the test to Web Chat as soon as `window.WebChat` is set, before the page renders it. Called once,
 * when the page-object loads.
 */
export function installTestEngine() {
  let webChat = window.WebChat;

  webChat && applyTestEngine(webChat.internal);

  Object.defineProperty(window, 'WebChat', {
    configurable: true,
    enumerable: true,
    get: () => webChat,
    set: value => {
      webChat = value;

      // Each bundle sets `window.WebChat` with its own internal entry.
      applyTestEngine(value?.internal);
    }
  });

  // An ESM page that imports "botframework-webchat" through its import map, and sets `window.WebChat` without the
  // internal entry: the internal entry of the same module. The page's own imports load it first, and `run()` talks to
  // the host before calling the test, so it is applied before Web Chat renders. Not a literal, so the bundler leaves it
  // to the browser.
  let importMap;

  try {
    importMap = JSON.parse(document.querySelector('script[type="importmap"]')?.textContent || '{}');
  } catch {
    importMap = {};
  }

  if (importMap.imports?.['botframework-webchat']) {
    const specifier = 'botframework-webchat';

    import(/* webpackIgnore: true */ specifier)
      .then(({ internal }) => {
        if (internal && !window.__WEBCHAT_TEST_INTERNAL__) {
          window.__WEBCHAT_TEST_INTERNAL__ = internal;

          applyTestEngine(internal);
        }
      })
      .catch(() => undefined);
  }
}
