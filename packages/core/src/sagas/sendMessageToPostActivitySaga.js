import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE } from '../actions/sendMessage';
import postActivity from '../actions/postActivity';
import startSpeakingActivity from '../actions/startSpeakingActivity';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(SEND_MESSAGE, function* ({ payload: { text, via } }) {
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
    });
  });
}
