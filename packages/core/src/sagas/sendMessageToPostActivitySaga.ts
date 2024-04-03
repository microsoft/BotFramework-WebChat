import mime from 'mime';
import { put, takeEvery } from 'redux-saga/effects';

import postActivity from '../actions/postActivity';
import sendMessage, { SEND_MESSAGE } from '../actions/sendMessage';
import whileConnected from './effects/whileConnected';

const getType = mime.getType.bind(mime);

function* postActivityWithMessage({
  payload: { attachments = [], channelData, method, text }
}: ReturnType<typeof sendMessage>) {
  yield put(
    postActivity(
      {
        attachments: attachments.map(({ name, thumbnail, url }) => ({
          contentType: getType(name) || 'application/octet-stream',
          contentUrl: url,
          name,
          thumbnailUrl: thumbnail
        })),
        channelData: {
          ...channelData,
          attachmentSizes: attachments.map(({ size }) => size)
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
