import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SET_SEND_BOX } from '../Actions/setSendBox';
import postActivity from '../Actions/postActivity';
import sleep from '../util/sleep';

const SEND_INTERVAL = 3000;

export default function* () {
  yield whileConnected(function* () {
    let lastSend = 0;

    yield takeLatest(SET_SEND_BOX, function* ({ payload: { text } }) {
      if (text) {
        const interval = SEND_INTERVAL - Date.now() + lastSend;

        if (interval > 0) {
          yield call(sleep, interval);
        }

        yield put(postActivity({ type: 'typing' }));

        lastSend = Date.now();
      }
    });
  });
}
