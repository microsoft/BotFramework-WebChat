import { call, put, takeLatest } from 'redux-saga/effects';

import { CONNECT } from '../actions/connect';
import createPromiseQueue from '../createPromiseQueue';
import setNotification from '../actions/setNotification';
import getConnectivityStatusNotification from '../services/private/getConnectivityStatusNotification';

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
  const { shift, unsubscribe } = subscribeToPromiseQueue(directLine.connectionStatus$);

  try {
    let reconnecting = false;

    for (;;) {
      const value = yield call(shift);
      const { notification, reconnecting: nextReconnecting } = getConnectivityStatusNotification(value, reconnecting);

      reconnecting = nextReconnecting;

      if (notification) {
        yield put(setNotification(notification));
      }
    }
  } finally {
    unsubscribe();
  }
}

export default function* () {
  yield takeLatest(CONNECT, connectionStatusToNotification);
}
