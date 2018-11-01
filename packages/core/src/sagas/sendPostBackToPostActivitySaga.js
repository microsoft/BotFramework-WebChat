import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_POST_BACK } from '../actions/sendPostBack';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(SEND_POST_BACK, function* ({ payload: { value } }) {
      if (value) {
        yield put(postActivity({
          channelData: {
            postBack: true
          },
          text: typeof value === 'string' ? value : undefined,
          type: 'message',
          value: typeof value !== 'string' ? value : undefined
        }));
      }
    });
  });
}
