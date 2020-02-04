/* eslint no-magic-numbers: ["error", { "ignore": [1, 2, 3, 4] }] */

import { call, put, takeLatest } from 'redux-saga/effects';

import { CONNECT } from '../actions/connect';
import createPromiseQueue from '../createPromiseQueue';
import setNotification from '../actions/setNotification';

const CONNECTIVITY_STATUS_NOTIFICATION_ID = 'connectivitystatus';

function subscribeToPromiseQueue(observable) {
  const { push, shift } = createPromiseQueue();
  const subscription = observable.subscribe({ next: push });

  return {
    shift,
    unsubscribe() {
      subscription.unsubscribe();
    }
  };
}

function* connectionStatusToNotification({ payload: { directLine } }) {
  let numConnecting = 0;

  const { shift, unsubscribe } = subscribeToPromiseQueue(directLine.connectionStatus$);

  try {
    for (;;) {
      const value = yield call(shift);

      switch (value) {
        case 1:
          yield put(
            setNotification({
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'info',
              message: numConnecting++ ? 'reconnecting' : 'connecting',
              persistent: true
            })
          );

          break;

        case 2:
          yield put(
            setNotification({
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'success',
              message: 'connected',
              persistent: true
            })
          );

          break;

        case 3:
        case 4:
          yield put(
            setNotification({
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'error',
              message: 'failedtoconnect',
              persistent: true
            })
          );

          break;

        default:
          break;
      }
    }
  } finally {
    unsubscribe();
  }
}

export default function*() {
  yield takeLatest(CONNECT, connectionStatusToNotification);
}
