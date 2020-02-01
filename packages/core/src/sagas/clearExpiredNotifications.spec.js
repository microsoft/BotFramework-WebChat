import { install } from 'lolex';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { SET_NOTIFICATION } from '../actions/setNotification';
import clearExpiredNotificationsSaga from './clearExpiredNotifications';
import notifications from '../reducers/notifications';

let clock;
let dispatch;
let getState;
let sagaMiddleware;

beforeEach(() => {
  clock = install();

  sagaMiddleware = createSagaMiddleware();

  const store = createStore(combineReducers({ notifications }), applyMiddleware(sagaMiddleware));

  sagaMiddleware.run(clearExpiredNotificationsSaga);

  dispatch = store.dispatch;
  getState = store.getState;
});

afterEach(() => {
  clock.uninstall();
});

test('setup', () => {
  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [],
    }
  `);
});

test('clear expired notifications via timeout', async () => {
  dispatch({
    type: SET_NOTIFICATION,
    payload: {
      alt: 'Connectivity status: Connecting',
      id: 'connectivity',
      level: 'info',
      message: 'Connecting',
      persistent: true
    }
  });

  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [
        Object {
          "alt": "Connectivity status: Connecting",
          "expireAt": undefined,
          "id": "connectivity",
          "level": "info",
          "message": "Connecting",
          "persistent": true,
          "timestamp": 0,
        },
      ],
    }
  `);

  // After 1 second later, it become connected.
  await clock.tickAsync(1000);

  dispatch({
    type: SET_NOTIFICATION,
    payload: {
      alt: 'Connectivity status: Connected',
      expireAt: 0,
      id: 'connectivity',
      level: 'info',
      message: 'Connected',
      persistent: true
    }
  });

  // Until the clock ticks, the instantly-expiring notification should still go into the state.
  // This give the UI layer a chance to debounce the notification, so they don't look flashy.
  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [
        Object {
          "alt": "Connectivity status: Connected",
          "expireAt": 0,
          "id": "connectivity",
          "level": "info",
          "message": "Connected",
          "persistent": true,
          "timestamp": 1000,
        },
      ],
    }
  `);

  await clock.tickAsync(0);

  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [],
    }
  `);
});

test('clear expired notifications when a new notification is set', async () => {
  dispatch({
    type: SET_NOTIFICATION,
    payload: {
      alt: 'Connectivity status: Connected',
      expireAt: 0,
      id: 'connectivity',
      level: 'info',
      message: 'Connected',
      persistent: true
    }
  });

  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [
        Object {
          "alt": "Connectivity status: Connected",
          "expireAt": 0,
          "id": "connectivity",
          "level": "info",
          "message": "Connected",
          "persistent": true,
          "timestamp": 0,
        },
      ],
    }
  `);

  dispatch({
    type: SET_NOTIFICATION,
    payload: {
      id: 'connectivity',
      level: 'info',
      message: 'Read our privacy policy here.'
    }
  });

  expect(getState()).toMatchInlineSnapshot(`
    Object {
      "notifications": Array [
        Object {
          "alt": undefined,
          "expireAt": undefined,
          "id": "connectivity",
          "level": "info",
          "message": "Read our privacy policy here.",
          "persistent": undefined,
          "timestamp": 0,
        },
      ],
    }
  `);
});
