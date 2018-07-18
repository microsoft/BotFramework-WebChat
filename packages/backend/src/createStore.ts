import { applyMiddleware, createStore, Store } from 'redux';
import { DirectLine, DirectLineOptions } from 'botframework-directlinejs';
import createSagaMiddleware from 'redux-saga';
import reducer from './reducer';
import createDirectLineMiddleware from './directLineMiddleware';
import directLineSaga from './directLineSaga';

export type State = {}
export type ChatStore = Store<State>

export default function () {
  const sagaMiddleware = createSagaMiddleware();
  const store: Store<State> = createStore(
    reducer,
    {},
    applyMiddleware(
      sagaMiddleware,
      // createDirectLineMiddleware(),
      store => next => action => {
        console.log(action);

        return next(action);
      }
    )
  );

  sagaMiddleware.run(directLineSaga);

  return store;
}
