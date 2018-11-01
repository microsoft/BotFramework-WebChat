import {
  call,
  cancel,
  cancelled,
  fork,
  put,
  take,
} from 'redux-saga/effects';

import { decode } from 'jsonwebtoken';

import callUntil from './effects/callUntil';
import forever from './effects/forever';

import createPromiseQueue from '../createPromiseQueue';

import {
  CONNECT,
  CONNECT_PENDING,
  CONNECT_REJECTED,
  CONNECT_FULFILLING,
  CONNECT_FULFILLED
} from '../actions/connect';

import {
  DISCONNECT,
  DISCONNECT_PENDING,
  DISCONNECT_REJECTED,
  DISCONNECT_FULFILLED
} from '../actions/disconnect';

// const UNINITIALIZED = 0;
// const CONNECTING = 1;
const ONLINE = 2;
// const EXPIRED_TOKEN = 3;
// const FAILED_TO_CONNECT = 4;
const ENDED = 5;

const DEFAULT_USER_ID = 'default-user';

export default function* () {
  for (;;) {
    const { payload: { directLine, userID } } = yield take(CONNECT);
    const { token } = directLine;
    const { user: userIDFromToken } = decode(token) || {};

    if (userIDFromToken) {
      if (userID && userID !== userIDFromToken) {
        console.warn('Web Chat: user ID is both specified in the Direct Line token and passed in, will use the user ID from the token.');
      }

      userID = userIDFromToken;
    } else if (userID) {
      if (typeof userID !== 'string') {
        console.warn('Web Chat: user ID must be a string.');
        userID = DEFAULT_USER_ID;
      } else if (/^dl_/.test(userID)) {
        console.warn('Web Chat: user ID prefixed with "dl_" is reserved and must be embedded into the Direct Line token to prevent forgery.');
        userID = DEFAULT_USER_ID;
      }
    } else {
      // Only specify "default-user" if not found from token and not passed in
      userID = DEFAULT_USER_ID;
    }

    const connectTask = yield fork(connectSaga, directLine, userID);

    yield take(DISCONNECT);
    yield call(disconnectSaga, connectTask, directLine);
  }
}

function* connectSaga(directLine, userID) {
  const meta = { userID };

  yield put({ type: CONNECT_PENDING, meta });

  const connectionStatusQueue = createPromiseQueue();
  const connectionStatusSubscription = directLine.connectionStatus$.subscribe({ next: connectionStatusQueue.push });

  // DirectLineJS start the connection only after the first subscriber for activity$, but not connectionStatus$
  const activitySubscription = directLine.activity$.subscribe({ next: () => 0 });

  try {
    try {
      yield callUntil(connectionStatusQueue.shift, [], connectionStatus => connectionStatus === ONLINE);
      yield put({ type: CONNECT_FULFILLING, meta, payload: { directLine } });
      yield put({ type: CONNECT_FULFILLED, meta, payload: { directLine } });
    } catch (err) {
      yield put({ type: CONNECT_REJECTED, error: true, meta, payload: err });
    } finally {
      if (yield cancelled()) {
        yield put({ type: CONNECT_REJECTED, error: true, meta, payload: new Error('cancelled') });
      }
    }

    yield forever();
  } finally {
    // TODO: [P2] DirectLineJS should kill the connection when we unsubscribe
    //       But currently in v3, DirectLineJS does not have this functionality
    //       Thus, we need to call "end()" explicitly
    directLine.end();
    activitySubscription.unsubscribe();
    connectionStatusSubscription.unsubscribe();
  }
}

function* disconnectSaga(connectTask, directLine) {
  yield put({ type: DISCONNECT_PENDING });

  const connectionStatusQueue = createPromiseQueue();
  const unsubscribe = directLine.connectionStatus$.subscribe({ next: connectionStatusQueue.push });

  // DirectLineJS should cancel underlying REST/WS when we cancel
  // the connect task, which subsequently unsubscribe connectionStatus$
  yield cancel(connectTask);

  try {
    yield callUntil(connectionStatusQueue.shift, [], connectionStatus => connectionStatus === ENDED);
    yield put({ type: DISCONNECT_FULFILLED });
  } catch (err) {
    yield put({ type: DISCONNECT_REJECTED, error: true, payload: err });
  } finally {
    if (yield cancelled()) {
      yield put({ type: DISCONNECT_REJECTED, error: true, payload: new Error('cancelled') });
    }

    unsubscribe();
  }
}
