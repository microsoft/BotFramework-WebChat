import { put, takeEvery } from 'redux-saga/effects';
import postActivity from '../actions/postActivity';
import { SEND_MESSAGE_BACK } from '../actions/sendMessageBack';
import whileConnected from './effects/whileConnected';

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
function* postActivityWithMessageBack({ payload: { displayText, text, value } }) {
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

function* sendMessageBackToPostActivity() {
  yield takeEvery(SEND_MESSAGE_BACK, postActivityWithMessageBack);
}

export default function* sendMessageBackToPostActivitySaga() {
  yield whileConnected(sendMessageBackToPostActivity);
}
