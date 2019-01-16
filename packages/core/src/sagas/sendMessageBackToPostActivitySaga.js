import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_MESSAGE_BACK } from '../actions/sendMessageBack';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(sendMessageBackToPostActivity);
}

function* sendMessageBackToPostActivity() {
  yield takeEvery(
    SEND_MESSAGE_BACK,
    postActivityWithMessageBack
  );
}


function* postActivityWithMessageBack({ payload: { displayText, text, value }}) {
  if (text || value) {
    yield put(postActivity({
      channelData: {
        messageBack: {
          displayText
        }
      },
      text,
      type: 'message',
      value
    }));
  }
}
