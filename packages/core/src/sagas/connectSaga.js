/* eslint no-magic-numbers: ["error", { "ignore": [0, 10] }] */

import { call, cancel, cancelled, fork, put, race, take } from 'redux-saga/effects';

import { ConnectionStatus } from 'botframework-directlinejs';
import { decode } from 'jsonwebtoken';

import { CONNECT } from '../actions/connect';
import createPromiseQueue from '../createPromiseQueue';
import forkPut from './effects/forkPut';
import uniqueID from '../utils/uniqueID';
import updateConnectionStatus, { UPDATE_CONNECTION_STATUS } from '../actions/updateConnectionStatus';

import { DISCONNECT, DISCONNECT_PENDING, DISCONNECT_FULFILLED } from '../actions/disconnect';

import { RECONNECT } from '../actions/reconnect';

const { Connecting: CONNECTING, Online: ONLINE, Uninitialized: UNINITIALIZED } = ConnectionStatus;

function randomUserID() {
  return `r_${uniqueID().substr(0, 10)}`;
}

function* observeAndPutConnectionStatusUpdate(directLine) {
  const connectionStatusQueue = createPromiseQueue();
  const connectionStatusSubscription = directLine.connectionStatus$.subscribe({ next: connectionStatusQueue.push });

  try {
    for (;;) {
      const connectionStatus = yield call(connectionStatusQueue.shift);

      yield put(updateConnectionStatus(connectionStatus));
    }
  } finally {
    connectionStatusSubscription.unsubscribe();
  }
}

// TODO: [P2] We should move this check and rectification to DirectLineJS.
function rectifyUserID(directLine, userIDFromAction) {
  const { token } = directLine;
  const { user: userIDFromToken } = decode(token) || {};

  if (userIDFromToken) {
    if (userIDFromAction && userIDFromAction !== userIDFromToken) {
      console.warn(
        'Web Chat: user ID is both specified in the Direct Line token and passed in, will use the user ID from the token.'
      );
    }

    return userIDFromToken;
  } else if (userIDFromAction) {
    if (typeof userIDFromAction !== 'string') {
      console.warn('Web Chat: user ID must be a string.');

      return randomUserID();
    } else if (/^dl_/u.test(userIDFromAction)) {
      console.warn(
        'Web Chat: user ID prefixed with "dl_" is reserved and must be embedded into the Direct Line token to prevent forgery.'
      );

      return randomUserID();
    }
  } else {
    return randomUserID();
  }

  return userIDFromAction;
}

// We could make this a Promise instead of saga (function generator) to make the code cleaner, if:
// 1. We found a way to cancel Promise
// 2. subscribe() are shared amongst all subscriptions, e.g. turn Observable into events
function* connectSaga(directLine) {
  // DirectLineJS starts the connection only after the first subscriber for activity$, not connectionStatus$
  const activitySubscription = directLine.activity$.subscribe({ next: () => 0 });
  const unsubscribeActivity = activitySubscription.unsubscribe.bind(activitySubscription);

  try {
    for (;;) {
      const {
        payload: { connectionStatus }
      } = yield take(UPDATE_CONNECTION_STATUS);

      if (connectionStatus === ONLINE) {
        // TODO: [P2] DirectLineJS should kill the connection when we unsubscribe
        //       But currently in v3, DirectLineJS does not have this functionality
        //       Thus, we need to call "end()" explicitly

        return () => {
          unsubscribeActivity();
          directLine.end();
        };
      } else if (connectionStatus !== UNINITIALIZED && connectionStatus !== CONNECTING) {
        throw new Error(`Failed to connect, DirectLineJS returned ${connectionStatus}.`);
      }
    }
  } catch (err) {
    // We will unsubscribe if we failed to connect or got cancelled only.
    // We should not unsubscribe in happy case, because DirectLineJS should relying on the subscription to connect/disconnect.
    unsubscribeActivity();

    throw err;
  } finally {
    if (yield cancelled()) {
      unsubscribeActivity();
    }
  }
}

function* reconnectSaga() {
  for (;;) {
    const {
      payload: { connectionStatus }
    } = yield take(UPDATE_CONNECTION_STATUS);

    if (connectionStatus === ONLINE) {
      break;
    } else if (connectionStatus !== CONNECTING) {
      throw new Error(`Failed to reconnect. DirectLineJS returned ${connectionStatus}.`);
    }
  }
}

// This is similar to behavior of redux-promise-middleware, but using saga instead of Promise.
// We guarantee PENDING -> FULFILLING -> FULFILLED, or PENDING -> REJECTED. This will help us simplify logic in other part of code.
// Note that after the saga is cancelled, subsequent call to put() will be ignored silently.
function* runAsyncEffect({ type, meta, payload }, callEffectFactory) {
  try {
    yield forkPut({ type: `${type}_PENDING`, meta, payload });

    const result = yield callEffectFactory();

    yield forkPut({ type: `${type}_FULFILLING`, meta, payload }, { type: `${type}_FULFILLED`, meta, payload });

    return result;
  } catch (payload) {
    yield forkPut({ type: `${type}_REJECTED`, error: true, meta, payload });

    throw payload;
  }
}

function* takeDisconnectAsError() {
  yield take(DISCONNECT);

  throw new Error('disconnected');
}

function runAsyncEffectUntilDisconnect(baseAction, callEffectFactory) {
  // We cannot use saga cancel() here, because cancelling saga will prohibit us from sending *_REJECTED.
  // Without REJECTED, it impacts our assumptions around PENDING/FULFILLED/REJECTED.
  return runAsyncEffect(baseAction, function* runUntilDisconnect() {
    const { result } = yield race({
      _: takeDisconnectAsError(),
      result: callEffectFactory()
    });

    return result;
  });
}

export default function*() {
  for (;;) {
    const {
      payload: { directLine, userID: userIDFromAction, username }
    } = yield take(CONNECT);

    const updateConnectionStatusTask = yield fork(observeAndPutConnectionStatusUpdate, directLine);
    let disconnectMeta;

    // TODO: [P2] Checks if this attached subtask will get killed if the parent task is complete (peacefully), errored out, or cancelled.
    const meta = {
      userID: rectifyUserID(directLine, userIDFromAction),
      username
    };

    // We will dispatch CONNECT_PENDING, wait for connect completed, errored, or cancelled (thru disconnect).
    // Then dispatch CONNECT_FULFILLED/CONNECT_REJECTED as needed.
    try {
      const endDirectLine = yield runAsyncEffectUntilDisconnect(
        {
          type: CONNECT,
          meta,
          payload: { directLine }
        },
        () => call(connectSaga, directLine)
      );

      try {
        for (;;) {
          // We are waiting for connection status change or disconnect action.
          const { updateConnectionStatusAction: { payload: { connectionStatus } = {} } = {} } = yield race({
            _: take(DISCONNECT),
            updateConnectionStatusAction: take(UPDATE_CONNECTION_STATUS)
          });

          // If it is not disconnect action, connectionStatus will not be undefined.
          if (connectionStatus === CONNECTING) {
            // If DirectLineJS changed connectionStatus to CONNECTING, we will treat it as reconnect status.
            yield runAsyncEffectUntilDisconnect(
              {
                type: RECONNECT,
                meta,
                payload: { directLine }
              },
              () => call(reconnectSaga)
            );
          } else if (connectionStatus !== ONLINE) {
            if (typeof connectionStatus !== 'undefined') {
              // We need to kill the connection because DirectLineJS want to close it.
              throw new Error(`Connection status changed to ${connectionStatus}`);
            } else {
              // Someone dispatched disconnect action.
              break;
            }
          }
        }
      } finally {
        endDirectLine();
      }
    } catch (error) {
      disconnectMeta = { error };
    } finally {
      yield cancel(updateConnectionStatusTask);

      // Even if the connection is interrupted, we will still emit DISCONNECT_PENDING.
      // This will makes handling logic easier. If CONNECT_FULFILLED, we guarantee DISCONNECT_PENDING.
      yield forkPut(
        { type: DISCONNECT_PENDING, meta: disconnectMeta, payload: { directLine } },
        { type: DISCONNECT_FULFILLED, meta: disconnectMeta, payload: { directLine } }
      );
    }
  }
}
