import { call, put, race, take } from 'redux-saga/effects';

import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING } from '../actions/connect';
import { RECONNECT_FULFILLED, RECONNECT_PENDING, RECONNECT_REJECTED } from '../actions/reconnect';
import sleep from '../utils/sleep';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

const SLOW_CONNECTION_AFTER = 15000;

export default function* detectSlowConnectionSaga(ponyfill: GlobalScopePonyfill) {
  for (;;) {
    yield take([CONNECT_PENDING, RECONNECT_PENDING]);

    const connectivityRace = yield race({
      fulfilled: take([CONNECT_FULFILLED, RECONNECT_FULFILLED]),
      rejected: take([CONNECT_REJECTED, RECONNECT_REJECTED]),
      slow: call(sleep, SLOW_CONNECTION_AFTER, ponyfill)
    });

    if ('slow' in connectivityRace) {
      yield put({ type: CONNECT_STILL_PENDING });
    }
  }
}
