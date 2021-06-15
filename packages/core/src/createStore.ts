/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// This is for the racing between sagaMiddleware and store
/* eslint no-use-before-define: "off" */

import { applyMiddleware, createStore as createReduxStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import reducer from './reducer';
import sagaError from './actions/sagaError';
import sagas from './sagas';

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

export default function createStore(initialState?, ...middlewares): Store {
  const { enhancer, sagaMiddleware } = createEnhancerAndSagaMiddleware(() => store, ...middlewares);
  const store = createReduxStore(reducer, initialState || {}, enhancer);

  sagaMiddleware.run(sagas);

  return store;
}

export function withDevTools(initialState?, ...middlewares): Store {
  const { enhancer, sagaMiddleware } = createEnhancerAndSagaMiddleware(() => store, ...middlewares);
  const store = createReduxStore(reducer, initialState || {}, composeWithDevTools(enhancer));

  sagaMiddleware.run(sagas);

  return store;
}
