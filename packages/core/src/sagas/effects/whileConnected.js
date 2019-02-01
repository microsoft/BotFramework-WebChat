import {
  call,
  cancel,
  fork,
  take
} from 'redux-saga/effects';

import { CONNECT_FULFILLING } from '../../actions/connect';
import { DISCONNECT_PENDING } from '../../actions/disconnect';

export default function (fn) {
  return call(function* () {
    for (;;) {
      const { meta: { userID, username }, payload: { directLine } } = yield take(CONNECT_FULFILLING);
      const task = yield fork(fn, { directLine, userID, username });

      // When we receive DISCONNECT_PENDING, the Direct Line connection is tearing down and should not be used.
      yield take(DISCONNECT_PENDING);
      yield cancel(task);
    }
  });
}
