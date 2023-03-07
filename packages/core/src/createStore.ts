import { applyMiddleware, createStore as createReduxStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import createReducer from './createReducer';
import createSagas from './createSagas';
import sagaError from './actions/sagaError';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';

type CreateStoreOptions = {
  devTools?: boolean;
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

export function withOptions(options: CreateStoreOptions, initialState?, ...middlewares): Store {
  const ponyfillFromOptions: Partial<GlobalScopePonyfill> = options.ponyfill || {};

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

export default function createStore(initialState?, ...middlewares): Store {
  return withOptions({}, initialState, ...middlewares);
}

export function withDevTools(initialState?, ...middlewares): Store {
  return withOptions({ devTools: true }, initialState, ...middlewares);
}
