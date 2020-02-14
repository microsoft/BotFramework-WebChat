// This is for the racing between sagaMiddleware and store
/* eslint no-use-before-define: "off" */

import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from './reducer';
import sagaError from './actions/sagaError';
import sagas from './sagas';

export default function createWebChatStore(initialState, ...middlewares) {
  const sagaMiddleware = createSagaMiddleware({
    onError: (...args) => {
      const [err] = args;

      console.error(err);

      store.dispatch(sagaError());
    }
  });

  const store = createStore(reducer, initialState || {}, applyMiddleware(...middlewares, sagaMiddleware));

  sagaMiddleware.run(sagas);

  return store;
}
