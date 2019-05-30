import { put, takeEvery } from 'redux-saga/effects';

import { SEND_FILES } from '../actions/sendFiles';
import mime from '../utils/mime-wrapper';
import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

const getType = mime.getType.bind(mime);

function* postActivityWithFiles({ payload: { files } }) {
  yield put(
    postActivity({
      attachments: [].map.call(files, ({ name, url }) => ({
        contentType: getType(name) || 'application/octet-stream',
        contentUrl: url,
        name
      })),
      channelData: {
        attachmentSizes: [].map.call(files, ({ size }) => size)
      },
      type: 'message'
    })
  );
}

function* sendFilesToPostActivity() {
  yield takeEvery(({ payload, type }) => type === SEND_FILES && payload.files.length, postActivityWithFiles);
}

export default function* sendFilesToPostActivitySaga() {
  yield whileConnected(sendFilesToPostActivity);
}
