// This is for the ternary operator of text and value.
/* eslint no-undefined: "off" */

import { put, takeEvery } from 'redux-saga/effects';

import { SEND_POST_BACK } from '../actions/sendPostBack';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithPostBack({ payload: { value } }) {
  yield put(
    postActivity({
      channelData: {
        postBack: true
      },
      text: typeof value === 'string' ? value : undefined,
      type: 'message',
      value: typeof value !== 'string' ? value : undefined
    })
  );
}

function* sendPostBackToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_POST_BACK && payload.value, postActivityWithPostBack);
}

export default function* sendPostBackToPostActivitySaga() {
  yield whileConnected(sendPostBackToPostActivity);
}
