import { call, cancel, fork, take } from 'redux-saga/effects';

import { CONNECT_FULFILLING } from '../../actions/connect';
import { DISCONNECT_PENDING } from '../../actions/disconnect';
import { RECONNECT_PENDING, RECONNECT_FULFILLING } from '../../actions/reconnect';

export default function whileConnectedEffect(fn) {
  return call(function* whileConnected() {
    for (;;) {
      const {
        meta: { userID, username },
        payload: { directLine }
      } = yield take([CONNECT_FULFILLING, RECONNECT_FULFILLING]);
      const task = yield fork(fn, { directLine, userID, username });

      // When we receive DISCONNECT_PENDING or RECONNECT_PENDING, the Direct Line connection is currently busy and should not be used.

      yield take([DISCONNECT_PENDING, RECONNECT_PENDING]);
      yield cancel(task);
    }
  });
}
