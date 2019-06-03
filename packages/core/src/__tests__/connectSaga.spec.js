/* eslint no-magic-numbers: "off" */

import connectSaga from '../sagas/connectSaga';
import Observable from 'core-js/library/es7/observable';

import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';

let connectionStatusObserver;
let directLine;
let store;

beforeEach(() => {
  const sagaMiddleware = createSagaMiddleware();

  store = createStore(
    ({ actionTypes = [] } = {}, { type }) =>
      /^DIRECT_LINE\/(DIS|RE)?CONNECT/u.test(type)
        ? // We are only interested in CONNECT_*, RECONNECT_*, and DISCONNECT_* actions.
          { actionTypes: [...actionTypes, type] }
        : { actionTypes },
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(connectSaga);

  directLine = {
    activity$: new Observable(() => () => 0),
    connectionStatus$: new Observable(observer => {
      connectionStatusObserver = observer;
      observer.next(0);
    }),
    end: () => 0,
    postActivity: () =>
      new Observable(observer => {
        observer.next({ id: '' });
      })
  };
});

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('Connect successfully', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual(['DIRECT_LINE/CONNECT', 'DIRECT_LINE/CONNECT_PENDING']);

  connectionStatusObserver.next(2);

  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED'
  ]);
});

test('Connect failed initially', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual(['DIRECT_LINE/CONNECT', 'DIRECT_LINE/CONNECT_PENDING']);

  connectionStatusObserver.next(4);

  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_REJECTED',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Connection failed after established', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);
  connectionStatusObserver.next(4);

  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Request to disconnect before connection established', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);

  store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT',
    'DIRECT_LINE/CONNECT_REJECTED',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Request to disconnect after connection established', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/DISCONNECT',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Reconnect after connection established', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);
  connectionStatusObserver.next(1);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING'
  ]);

  connectionStatusObserver.next(2);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING',
    'DIRECT_LINE/RECONNECT_FULFILLING',
    'DIRECT_LINE/RECONNECT_FULFILLED'
  ]);
});

test('Reconnect failed', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);
  connectionStatusObserver.next(1);
  connectionStatusObserver.next(4);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING',
    'DIRECT_LINE/RECONNECT_REJECTED',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Request to disconnect when reconnecting', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);
  connectionStatusObserver.next(1);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT',
    'DIRECT_LINE/RECONNECT_REJECTED',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});

test('Request to disconnect after reconnected', async () => {
  store.dispatch({
    type: 'DIRECT_LINE/CONNECT',
    payload: { directLine }
  });

  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);
  connectionStatusObserver.next(1);
  connectionStatusObserver.next(2);

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });

  // TODO: [P4] Investigates why we need to sleep 0 here
  await sleep(0);

  expect(store.getState().actionTypes).toEqual([
    'DIRECT_LINE/CONNECT',
    'DIRECT_LINE/CONNECT_PENDING',
    'DIRECT_LINE/CONNECT_FULFILLING',
    'DIRECT_LINE/CONNECT_FULFILLED',
    'DIRECT_LINE/RECONNECT_PENDING',
    'DIRECT_LINE/RECONNECT_FULFILLING',
    'DIRECT_LINE/RECONNECT_FULFILLED',
    'DIRECT_LINE/DISCONNECT',
    'DIRECT_LINE/DISCONNECT_PENDING',
    'DIRECT_LINE/DISCONNECT_FULFILLED'
  ]);
});
