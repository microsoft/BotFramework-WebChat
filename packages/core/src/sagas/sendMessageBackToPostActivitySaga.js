import { put, takeEvery } from 'redux-saga/effects';

import { SEND_MESSAGE_BACK } from '../actions/sendMessageBack';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

function* postActivityWithMessageBack({ payload: { displayText, text, value } }) {
  if (text || value) {
    yield put(
      postActivity({
        channelData: {
          messageBack: {
            displayText
          }
        },
        text,
        type: 'message',
        value
      })
    );
  }
}

function* sendMessageBackToPostActivity() {
  yield takeEvery(SEND_MESSAGE_BACK, postActivityWithMessageBack);
}

export default function* sendMessageBackToPostActivitySaga() {
  yield whileConnected(sendMessageBackToPostActivity);
}
