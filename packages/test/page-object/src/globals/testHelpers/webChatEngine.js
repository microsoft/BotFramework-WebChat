// The store that Web Chat runs on in an html2 test: "redux" (the default) or "webchat" (the Web Chat engine, internal
// and for tests only until it replaces the Redux store).
//
// - The runner sets it for every page from `WEBCHAT_TEST_ENGINE`, as the "webchat-test-engine" parameter of the URL
//   fragment, and as a cookie of the same name (kept when a page redirects to another fragment).
// - With "webchat", `createStore()` of the helpers creates the engine. Pages that call `WebChat.createStore()`
//   themselves, or render without a store, stay on Redux.

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
  return window.__webChatTestInternal__ || window.WebChat?.internal;
}

/**
 * Notes the kind of a store that the helpers created, for `done()` of the runner: with "webchat", it fails the test if
 * one of them is a Redux store.
 */
export function noteTestStore(store) {
  // Only a Redux store has `replaceReducer()`.
  (window.__webChatTestStores__ = window.__webChatTestStores__ || []).push(
    typeof store.replaceReducer === 'function' ? 'redux' : 'webchat'
  );
}

/**
 * With "webchat", finds the internal entry of an ESM page that imports "botframework-webchat" through its import map,
 * and sets `window.WebChat` without it. Called once, when the page-object loads.
 */
export function installTestEngine() {
  if (getTestEngine() !== 'webchat') {
    return;
  }

  let importMap;

  try {
    importMap = JSON.parse(document.querySelector('script[type="importmap"]')?.textContent || '{}');
  } catch {
    importMap = {};
  }

  // The page's own imports load the module first, and `run()` talks to the host before calling the test, so the entry
  // is set before the helpers need it. Not a literal, so the bundler leaves it to the browser.
  if (importMap.imports?.['botframework-webchat']) {
    const specifier = 'botframework-webchat';

    import(/* webpackIgnore: true */ specifier)
      .then(({ internal }) => {
        window.__webChatTestInternal__ = window.__webChatTestInternal__ || internal;
      })
      .catch(() => undefined);
  }
}
