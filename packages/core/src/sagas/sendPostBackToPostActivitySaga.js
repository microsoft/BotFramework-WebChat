import {
  put,
  takeEvery
} from 'redux-saga/effects';

import { SEND_POST_BACK } from '../actions/sendPostBack';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

export default function* () {
  yield whileConnected(sendPostBackToPostActivity);
}

function* sendPostBackToPostActivity() {
  yield takeEvery(
    ({ payload, type }) => (
      type === SEND_POST_BACK
      && payload.value
    ),
    postActivityWithPostBack
  );
}

function* postActivityWithPostBack({ payload: { value } }) {
  yield put(postActivity({
    channelData: {
      postBack: true
    },
    text: typeof value === 'string' ? value : undefined,
    type: 'message',
    value: typeof value !== 'string' ? value : undefined
  }));
}
