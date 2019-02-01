import {
  call,
  cancel,
  cancelled,
  fork,
  put,
  take,
} from 'redux-saga/effects';

import { decode } from 'jsonwebtoken';
import random from 'math-random';

import updateConnectionStatus, { UPDATE_CONNECTION_STATUS } from '../actions/updateConnectionStatus';

import createPromiseQueue from '../createPromiseQueue';

import { ConnectionStatus } from 'botframework-directlinejs';

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
  DISCONNECT_FULFILLED
} from '../actions/disconnect';

const {
  Connecting: CONNECTING,
  Online: ONLINE,
  ExpiredToken: EXPIRED_TOKEN,
  FailedToConnect: FAILED_TO_CONNECT,
  Ended: ENDED
} = ConnectionStatus;

function randomUserID() {
  return `r_${ random().toString(36).substr(2, 10) }`;
}

function* observeAndPutConnectionStatusUpdate(directLine) {
  const connectionStatusQueue = createPromiseQueue();
  const connectionStatusSubscription = directLine.connectionStatus$.subscribe({
    next: connectionStatusQueue.push
  });

  try {
    for (;;) {
      const connectionStatus = yield call(connectionStatusQueue.shift);

      yield put(updateConnectionStatus(connectionStatus));
    }
  } finally {
    connectionStatusSubscription.unsubscribe();
  }
}

function negativeUpdateConnectionStatusAction({ payload, type }) {
  if (type === UPDATE_CONNECTION_STATUS) {
    const { connectionStatus } = payload;

    return (
      connectionStatus !== CONNECTING
      && connectionStatus !== ONLINE
    );
  }
}

function rectifyUserID(directLine, userIDFromAction) {
  const { token } = directLine;
  const { user: userIDFromToken } = decode(token) || {};

  if (userIDFromToken) {
    if (userIDFromAction && userIDFromAction !== userIDFromToken) {
      console.warn('Web Chat: user ID is both specified in the Direct Line token and passed in, will use the user ID from the token.');
    }

    return userIDFromToken;
  } else if (userIDFromAction) {
    if (typeof userIDFromAction !== 'string') {
      console.warn('Web Chat: user ID must be a string.');

      return randomUserID();
    } else if (/^dl_/.test(userIDFromAction)) {
      console.warn('Web Chat: user ID prefixed with "dl_" is reserved and must be embedded into the Direct Line token to prevent forgery.');

      return randomUserID();
    }
  } else {
    return randomUserID();
  }

  return userIDFromAction;
}

function* connectSaga(directLine) {
  // DirectLineJS start the connection only after the first subscriber for activity$, but not connectionStatus$
  const activitySubscription = directLine.activity$.subscribe({ next: () => 0 });

  try {
    for (;;) {
      const { payload: { connectionStatus } } = yield take(UPDATE_CONNECTION_STATUS);

      // We will ignore DISCONNECT actions until we connect

      if (connectionStatus === ONLINE) {
        // TODO: [P2] DirectLineJS should kill the connection when we unsubscribe
        //       But currently in v3, DirectLineJS does not have this functionality
        //       Thus, we need to call "end()" explicitly

        return () => {
          activitySubscription.unsubscribe();
          directLine.end();
        };
      } else if (
        connectionStatus === ENDED
        || connectionStatus === EXPIRED_TOKEN
        || connectionStatus === FAILED_TO_CONNECT
      ) {
        // If we receive anything negative, we will assume the connection is errored out
        throw new Error('Failed to connect');
      }
    }
  } finally {
    if (yield cancelled()) {
      activitySubscription.unsubscribe();

      throw new Error('Cancelled');
    }
  }
}

export default function* () {
  for (;;) {
    const {
      payload: {
        directLine,
        userID: userIDFromAction,
        username
      }
    } = yield take(CONNECT);
    const updateConnectionStatusTask = yield fork(observeAndPutConnectionStatusUpdate, directLine);

    try {
      const meta = {
        userID: rectifyUserID(directLine, userIDFromAction),
        username
      };

      let endDirectLine;

      yield put({ type: CONNECT_PENDING, meta });

      try {
        endDirectLine = yield call(connectSaga, directLine);
      } catch (err) {
        yield put({ type: CONNECT_REJECTED, error: true, meta, payload: err });

        continue;
      }

      // At this point, we established connection to Direct Line.
      // Any errors from this point, we need to make sure we call endDirectLine() to release resources.
      try {
        yield put({ type: CONNECT_FULFILLING, meta, payload: { directLine } });
        yield put({ type: CONNECT_FULFILLED, meta, payload: { directLine } });

        const terminateAction = yield take([DISCONNECT, negativeUpdateConnectionStatusAction]);

        // Even if the connection is interrupted, we will still emitting DISCONNECT_PENDING.
        // This will makes handling logic easier. If CONNECT_FULFILLED, we guarantee DISCONNECT_PENDING.
        yield put({ type: DISCONNECT_PENDING });

        endDirectLine();

        if (terminateAction.type === DISCONNECT) {
          // For graceful disconnect, we wait until Direct Line say it is ended
          yield take(negativeUpdateConnectionStatusAction);
        }
      } finally {
        // It is meaningless to continue to use the Direct Line object even disconnect failed.
        // We will still unsubscribe to incoming activities and consider Direct Line object abandoned.
        yield put({ type: DISCONNECT_FULFILLED });

        endDirectLine();
      }
    } finally {
      yield cancel(updateConnectionStatusTask);
    }
  }
}
