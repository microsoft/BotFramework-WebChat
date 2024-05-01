import { put, takeEvery } from 'redux-saga/effects';

import postActivity from '../actions/postActivity';
import type sendMessage from '../actions/sendMessage';
import { SEND_MESSAGE } from '../actions/sendMessage';
import whileConnected from './effects/whileConnected';

function* postActivityWithMessage({
  payload: { attachments = [], channelData, method, text }
}: ReturnType<typeof sendMessage>) {
  yield put(
    postActivity(
      {
        attachments: attachments.map(({ blob, thumbnailURL }) => ({
          contentType: (blob instanceof File && blob.type) || 'application/octet-stream',
          contentUrl: URL.createObjectURL(blob),
          name: blob instanceof File ? blob.name : undefined,
          thumbnailUrl: thumbnailURL?.toString()
        })),
        channelData: {
          ...channelData,
          attachmentSizes: attachments.map(({ blob: { size } }) => size)
        },
        text: text || undefined,
        textFormat: 'plain',
        type: 'message'
      } as any, // TODO: Fix WebChatActivity. Currently, it only works with incoming activity, not outgoing.
      method
    )
  );
}

function* sendMessageToPostActivity() {
  yield takeEvery(
    ({ payload, type }) => type === SEND_MESSAGE && (payload.text || payload.attachments?.length),
    postActivityWithMessage
  );
}

export default function* sendMessageToPostActivitySaga() {
  yield whileConnected(sendMessageToPostActivity);
}
