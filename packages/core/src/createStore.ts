import { applyMiddleware, createStore as createReduxStore, type Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import createReducer from './createReducer';
import createSagas from './createSagas';
import sagaError from './actions/sagaError';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';

type CreateStoreOptions = {
  /**
   * True, to enable Redux development tools, otherwise, false.
   *
   * Because Web Chat use sagas for business logics, some store state are keep at JavaScript heaps.
   * Time-travelling and saving/restoring store state are not supported.
   */
  devTools?: boolean;

  /**
   * Ponyfill to overrides specific global scope members.
   *
   * This option is for development use only. Not all features in Web Chat are ponyfilled.
   *
   * To fake timers, `setTimeout` and related functions can be passed to overrides the original global scope members.
   *
   * Please see [#4662](https://github.com/microsoft/BotFramework-WebChat/pull/4662) for details.
   */
  ponyfill?: Partial<GlobalScopePonyfill>;
};

function createEnhancerAndSagaMiddleware(getStore, ...middlewares) {
  const sagaMiddleware = createSagaMiddleware({
    onError: (...args) => {
      const [err] = args;

      console.error(err);

      const store = getStore();

      store && store.dispatch(sagaError());
    }
  });

  return {
    enhancer: applyMiddleware(...middlewares, sagaMiddleware),
    sagaMiddleware
  };
}

/**
 * Creates a Redux store internally used by Web Chat.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 */

// The complexity is introduced by the check of ponyfill.
// eslint-disable-next-line complexity
export function withOptions(options: CreateStoreOptions, initialState?, ...middlewares): Store {
  // IE Mode does not have `globalThis`.
  const globalThisOrWindow = typeof globalThis === 'undefined' ? window : globalThis;
  const ponyfillFromOptions: Partial<GlobalScopePonyfill> = options.ponyfill || {};

  // TODO: [P2] Dedupe: when we have an utility package, move this code there and mark it as internal use.
  const ponyfill: GlobalScopePonyfill = {
    cancelAnimationFrame:
      ponyfillFromOptions.cancelAnimationFrame ||
      // Using clock functions from global if not provided.
      // eslint-disable-next-line no-restricted-globals
      (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(globalThisOrWindow) : undefined),
    cancelIdleCallback:
      ponyfillFromOptions.cancelIdleCallback ||
      // eslint-disable-next-line no-restricted-globals
      (typeof cancelIdleCallback === 'function' ? cancelIdleCallback.bind(globalThisOrWindow) : undefined),
    clearImmediate:
      ponyfillFromOptions.clearImmediate ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearImmediate === 'function' ? clearImmediate.bind(globalThisOrWindow) : undefined),
    clearInterval:
      ponyfillFromOptions.clearInterval ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearInterval === 'function' ? clearInterval.bind(globalThisOrWindow) : undefined),
    clearTimeout:
      ponyfillFromOptions.clearTimeout ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearTimeout === 'function' ? clearTimeout.bind(globalThisOrWindow) : undefined),
    // eslint-disable-next-line no-restricted-globals
    Date: ponyfillFromOptions.Date || Date,
    requestAnimationFrame:
      ponyfillFromOptions.requestAnimationFrame ||
      // eslint-disable-next-line no-restricted-globals
      (typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(globalThisOrWindow) : undefined),
    requestIdleCallback:
      ponyfillFromOptions.requestIdleCallback ||
      // eslint-disable-next-line no-restricted-globals
      (typeof requestIdleCallback === 'function' ? requestIdleCallback.bind(globalThisOrWindow) : undefined),
    setImmediate:
      ponyfillFromOptions.setImmediate ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setImmediate === 'function' ? setImmediate.bind(globalThisOrWindow) : undefined),
    setInterval:
      ponyfillFromOptions.setInterval ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setInterval === 'function' ? setInterval.bind(globalThisOrWindow) : undefined),
    setTimeout:
      ponyfillFromOptions.setTimeout ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setTimeout === 'function' ? setTimeout.bind(globalThisOrWindow) : undefined)
  };

  // We are sure the "getStore" (first argument) is not called on "createEnhancerAndSagaMiddleware()".
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { enhancer, sagaMiddleware } = createEnhancerAndSagaMiddleware(() => store, ...middlewares);
  const store = createReduxStore(
    createReducer(ponyfill),
    initialState || {},
    options.devTools ? composeWithDevTools(enhancer) : enhancer
  );

  sagaMiddleware.run(createSagas({ ponyfill }));

  return store;
}

/**
 * Creates a Redux store internally used by Web Chat.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 */
export default function createStore(initialState?, ...middlewares): Store {
  return withOptions({}, initialState, ...middlewares);
}

/**
 * Creates a Redux store internally used by Web Chat, with Redux development tools.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 *
 * @deprecated Use `withOptions` instead and pass `{ devTools: true }`
 */
export function withDevTools(initialState?, ...middlewares): Store {
  return withOptions({ devTools: true }, initialState, ...middlewares);
}
