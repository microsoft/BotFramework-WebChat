import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import postActivity from '../Actions/postActivity';
import { SET_SEND_BOX } from '../Actions/setSendBox';
import sleep from '../util/sleep';

const SEND_INTERVAL = 3000;

export default function* () {
  yield whileConnected(function* (_, userID) {
    let lastSend = 0;

    yield takeLatest(SET_SEND_BOX, function* ({ payload: { text } }) {
      if (text) {
        const interval = SEND_INTERVAL - Date.now() + lastSend;

        if (interval > 0) {
          yield call(sleep, interval);
        }

        const language = yield select(({ settings: { language } }) => language);

        yield put(postActivity({
          from: {
            id: userID,
            role: 'user'
          },
          locale: language,
          timestamp: (new Date()).toISOString(),
          type: 'typing'
        }));

        lastSend = Date.now();
      }
    });
  });
}
