import {
  put,
  takeEvery
} from 'redux-saga/effects';

import mime from '../utils/mime-wrapper';

import whileConnected from './effects/whileConnected';

import { SEND_FILES } from '../actions/sendFiles';
import postActivity from '../actions/postActivity';

const getType = mime.getType.bind(mime);

export default function* () {
  yield whileConnected(sendFilesToPostActivity);
}

function* sendFilesToPostActivity() {
  yield takeEvery(
    ({ payload, type }) => (
      type === SEND_FILES
      && payload.files.length
    ),
    postActivityWithFiles
  );
}

function* postActivityWithFiles({ payload: { files } }) {
  yield put(postActivity({
    attachments: [].map.call(files, ({ name, url }) => ({
      contentType: getType(name) || 'application/octet-stream',
      contentUrl: url,
      name: name
    })),
    channelData: {
      attachmentSizes: [].map.call(files, ({ size }) => size)
    },
    type: 'message'
  }));
}
