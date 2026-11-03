import { put, takeEvery } from 'redux-saga/effects';
import postActivity from '../actions/postActivity';
import { SEND_MESSAGE_BACK, type SendMessageBackAction } from '../actions/sendMessageBack';
import type { WebChatActivity } from '../types/WebChatActivity';
import whileConnected from './effects/whileConnected';

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
function* postActivityWithMessageBack({ payload: { displayText, replyToId, text, value } }: SendMessageBackAction) {
  yield put(
    postActivity({
      channelData: {
        messageBack: {
          displayText
        }
        // TODO: [P2] We need to have a new type `OutgoingWebChatActivity`.
      } satisfies Record<string, unknown> as WebChatActivity['channelData'],
      replyToId,
      text,
      type: 'message',
      value
    } satisfies Omit<
      // TODO: [P2] We need to have a new type `OutgoingWebChatActivity`.
      WebChatActivity & { text: string | undefined; value: string | undefined },
      'from'
    > as WebChatActivity)
  );
}

function* sendMessageBackToPostActivity() {
  yield takeEvery(SEND_MESSAGE_BACK, postActivityWithMessageBack);
}

export default function* sendMessageBackToPostActivitySaga() {
  yield whileConnected(sendMessageBackToPostActivity);
}
