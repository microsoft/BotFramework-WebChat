/* eslint no-magic-numbers: "off" */

import { fork } from 'redux-saga/effects';
import Observable from 'core-js/features/observable';

import connectionStatusUpdateSaga from '../sagas/connectionStatusUpdateSaga';
import connectivityStatus from '../reducers/connectivityStatus';
import connectSaga from '../sagas/connectSaga';
import detectSlowConnectionSaga from '../sagas/detectSlowConnectionSaga';

import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, combineReducers, createStore } from 'redux';

let connectionStatusObserver;
let directLine;
let store;

function share(observable) {
  const observers = [];
  let subscription;

  return new Observable(observer => {
    observers.push(observer);

    if (!subscription) {
      subscription = observable.subscribe({
        complete: () => observers.forEach(observer => observer.complete()),
        error: err => observers.forEach(observer => observer.error(err)),
        next: value => observers.forEach(observer => observer.next(value))
      });
    }

    return () => {
      const index = observers.indexOf(observer);

      ~index && observers.splice(index, 1);

      if (!observers.length) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  });
}

beforeEach(() => {
  const sagaMiddleware = createSagaMiddleware();

  store = createStore(
    combineReducers({
      actionTypes: (actionTypes = [], { type }) =>
        /^DIRECT_LINE\/(DIS|RE)?CONNECT/u.test(type)
          ? // We are only interested in CONNECT_*, RECONNECT_*, and DISCONNECT_* actions.
            [...actionTypes, type]
          : actionTypes,
      connectivityStatus
    }),
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(function*() {
    yield fork(connectSaga);
    yield fork(connectionStatusUpdateSaga);
    yield fork(detectSlowConnectionSaga);
  });

  directLine = {
    activity$: new Observable(() => () => 0),
    connectionStatus$: share(
      new Observable(observer => {
        connectionStatusObserver = observer;
        observer.next(0);
      })
    ),
    end: () => 0,
    postActivity: () =>
      new Observable(observer => {
        observer.next({ id: '' });
      })
  };
});

jest.setTimeout(2000);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// This test verify the code will not regress bug #2655.
test('Race condition between connect slow and connect', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  // This line is critical.
  await 0;

  connectionStatusObserver.next(1);

  // This line is critical.
  await 0;

  connectionStatusObserver.next(2);

  // This line is critical.
  await 0;

  connectionStatusObserver.next(1);

  // This line is critical.
  await 0;

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING'
  ]);

  // We have a bug that we ignored RECONNECT_FULFILLED in detectSlowConnectionSaga.js.
  // Thus, after 15s passed, although it say it is connected, it turn back to "connecting slow".
  connectionStatusObserver.next(2);
  jest.advanceTimersByTime(15000);

  // This line is critical.
  await 0;

  // We want to make sure, 15s after reconnecting, the status don't change to "connecting slow".
  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING',
    'DIRECT_LINE/RECONNECT_FULFILLING',
    'DIRECT_LINE/RECONNECT_FULFILLED'
  ]);

  expect(store.getState().connectivityStatus).toBe('reconnected');
});
