import {
  call,
  cancel,
  fork,
  take
} from 'redux-saga/effects';

import { CONNECT_FULFILLING } from '../../actions/connect';
import { DISCONNECT_FULFILLED } from '../../actions/disconnect';

export default function (fn) {
  return call(function* () {
    for (;;) {
      const { meta: { userID }, payload: { directLine } } = yield take(CONNECT_FULFILLING);
      const task = yield fork(fn, directLine, userID);

      yield take(DISCONNECT_FULFILLED);
      yield cancel(task);
    }
  });
}
