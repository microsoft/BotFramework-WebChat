import { applyMiddleware, createStore, Store } from 'redux';
import { DirectLine, DirectLineOptions } from 'botframework-directlinejs';
import createSagaMiddleware from 'redux-saga';

// import directLineSaga from './directLineSaga';
import reducer from './reducer';
import sagas from './sagas';

export type State = {}
export type ChatStore = Store<State>

export default function (initialState, ...middlewares) {
  const sagaMiddleware = createSagaMiddleware();
  const store: Store<State> = createStore(
    reducer,
    initialState || {},
    applyMiddleware(
      sagaMiddleware,
      store => next => action => {
        console.debug(action);

        return next(action);
      },
      ...middlewares
    )
  );

  sagaMiddleware.run(sagas);
  // sagaMiddleware.run(directLineSaga);

  return store;
}
