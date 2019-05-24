import { call, put, race, take } from 'redux-saga/effects';

import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING } from '../actions/connect';

import { RECONNECT_PENDING } from '../actions/reconnect';
import sleep from '../utils/sleep';

const SLOW_CONNECTION_AFTER = 15000;

export default function* detectSlowConnectionSaga() {
  for (;;) {
    yield take([CONNECT_PENDING, RECONNECT_PENDING]);

    const connectivityRace = yield race({
      fulfilled: take(CONNECT_FULFILLED),
      rejected: take(CONNECT_REJECTED),
      slow: call(() => sleep(SLOW_CONNECTION_AFTER))
    });

    if ('slow' in connectivityRace) {
      yield put({ type: CONNECT_STILL_PENDING });
    }
  }
}
