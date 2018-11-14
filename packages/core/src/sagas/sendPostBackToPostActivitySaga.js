import {
  put,
  take
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_POST_BACK } from '../actions/sendPostBack';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      const { payload: { value } } = yield take(SEND_POST_BACK);

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
    }
  });
}
