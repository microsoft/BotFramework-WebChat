import { put, select, takeEvery } from 'redux-saga/effects';

import postActivity from '../actions/postActivity';
import sendMessage, { SEND_MESSAGE } from '../actions/sendMessage';
import whileConnected from './effects/whileConnected';
import enableStreaming from '../selectors/enableStreaming';

function* postActivityWithMessage({
  payload: { attachments = [], channelData, method, text }
}: ReturnType<typeof sendMessage>) {
  const isStreamingEnabled = yield select(enableStreaming);
  yield put(
    postActivity(
      {
        attachments: attachments.map(({ blob, thumbnailURL }) => ({
          contentType: (blob instanceof File && blob.type) || 'application/octet-stream',
          // Chat adapter should download the file as binary.
          // In case the chat adapter naively echo back the URL, it will be treated as binary.
          // eslint-disable-next-line no-restricted-properties
          contentUrl: URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' })),
          name: blob instanceof File ? blob.name : undefined,
          thumbnailUrl: thumbnailURL?.toString()
        })),
        channelData: {
          ...channelData,
          attachmentSizes: attachments.map(({ blob: { size } }) => size)
        },
        ...(isStreamingEnabled && { deliveryMode: 'stream' }),
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
