import { put, takeEvery } from 'redux-saga/effects';

import { SEND_MESSAGE } from '../actions/sendMessage';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithMessage({ payload: { method, text } }) {
  yield put(
    postActivity(
      {
        text,
        textFormat: 'plain',
        type: 'message'
      },
      method
    )
  );
}

function* sendMessageToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_MESSAGE && payload.text, postActivityWithMessage);
}

export default function* sendMessageToPostActivitySaga() {
  yield whileConnected(sendMessageToPostActivity);
}
