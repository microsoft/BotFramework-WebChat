import {
  put,
  select,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SUBMIT_SEND_BOX } from '../Actions/submitSendBox';
import postActivity from '../Actions/postActivity';
import setSendBox from '../Actions/setSendBox';
import startSpeakingActivity from '../Actions/startSpeakingActivity';
import stopSpeakingActivity from '../Actions/stopSpeakingActivity';

export default function* () {
  yield whileConnected(function* (_, userID) {
    for (;;) {
      const { payload: { via } } = yield take(SUBMIT_SEND_BOX);
      const { language, text } = yield select(({ interface: { language }, input: { sendBox } }) => ({ language, text: sendBox }));

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

        yield put(setSendBox(''));

        if (via === 'speech') {
          yield put(startSpeakingActivity());
        } else {
          yield put(stopSpeakingActivity());
        }
      }
    }
  });
}
