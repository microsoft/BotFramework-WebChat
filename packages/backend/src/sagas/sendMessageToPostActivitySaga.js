import {
  put,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE } from '../Actions/sendMessage';
import postActivity from '../Actions/postActivity';
import startSpeakingActivity from '../Actions/startSpeakingActivity';
import stopSpeakingActivity from '../Actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      const { payload: { text, via } } = yield take(SEND_MESSAGE);
      const language = yield select(({ settings: { language } }) => language);

      if (text) {
        yield put(postActivity({
          from: {
            id: userID,
            role: 'user'
          },
          locale: language,
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
