import {
  put,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE } from '../actions/sendMessage';
import postActivity from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      const { payload: { text, via } } = yield take(SEND_MESSAGE);

      if (text) {
        yield put(postActivity({
          text,
          textFormat: 'plain',
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
