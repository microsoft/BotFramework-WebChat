import { applyMiddleware, createStore, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from './reducer';
import sagas from './sagas';

export type State = {}
export type ChatStore = Store<State>

export default function (initialState, ...middlewares) {
  const sagaMiddleware = createSagaMiddleware({
    onError: (...args) => {
      const [err] = args;

      console.error(err);

      store.dispatch({ type: 'WEB_CHAT/SAGA_ERROR' });
    }
   });

  const store: Store<State> = createStore(
    reducer,
    initialState || {},
    applyMiddleware(
      ...middlewares,
      sagaMiddleware
    )
  );

  sagaMiddleware.run(sagas);

  return store;
}
