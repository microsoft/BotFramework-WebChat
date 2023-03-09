import { applyMiddleware, createStore as createReduxStore, Store } from 'redux';
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
export function withOptions(options: CreateStoreOptions, initialState?, ...middlewares): Store {
  const ponyfillFromOptions: Partial<GlobalScopePonyfill> = options.ponyfill || {};

  // TODO: [P2] Dedupe: when we have an utility package, move this code there and mark it as internal use.
  const ponyfill: GlobalScopePonyfill = {
    // Using clock functions from global if not provided.
    // eslint-disable-next-line no-restricted-globals
    cancelAnimationFrame: ponyfillFromOptions.cancelAnimationFrame || cancelAnimationFrame.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    cancelIdleCallback: ponyfillFromOptions.cancelIdleCallback || cancelIdleCallback.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    clearImmediate: ponyfillFromOptions.clearImmediate || clearImmediate.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    clearInterval: ponyfillFromOptions.clearInterval || clearInterval.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    clearTimeout: ponyfillFromOptions.clearTimeout || clearTimeout.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    Date: ponyfillFromOptions.Date || Date,
    // eslint-disable-next-line no-restricted-globals
    requestAnimationFrame: ponyfillFromOptions.requestAnimationFrame || requestAnimationFrame.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    requestIdleCallback: ponyfillFromOptions.requestIdleCallback || requestIdleCallback.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    setImmediate: ponyfillFromOptions.setImmediate || setImmediate.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    setInterval: ponyfillFromOptions.setInterval || setInterval.bind(globalThis),
    // eslint-disable-next-line no-restricted-globals
    setTimeout: ponyfillFromOptions.setTimeout || setTimeout.bind(globalThis)
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
