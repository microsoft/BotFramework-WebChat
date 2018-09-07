import {
  put,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE } from '../Actions/sendMessage';
import postActivity from '../Actions/postActivity';
import startSpeakingActivity from '../Actions/startSpeakingActivity';
import stopSpeakingActivity from '../Actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      const { payload: { text, via } } = yield take(SEND_MESSAGE);

      if (text) {
        yield put(postActivity({
          text,
          textFormat: 'plain',
          timestamp: (new Date()).toISOString(),
          type: 'message'
        }));

        if (via === 'speech') {
          yield put(startSpeakingActivity());
        } else {
          yield put(stopSpeakingActivity());
        }
      }
    }
  });
}
