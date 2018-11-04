import {
  put,
  takeEvery
} from 'redux-saga/effects';

import mime from 'mime';

import whileConnected from './effects/whileConnected';

import { SEND_FILES } from '../actions/sendFiles';
import postActivity from '../actions/postActivity';
import stopSpeakingActivity from '../actions/stopSpeakingActivity';

const getType = mime.getType.bind(mime);

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(
      ({ payload, type }) =>
        type === SEND_FILES
        && payload
        && payload.files
        && payload.files.length,
      function* ({ payload: { files } }) {
        yield put(postActivity({
          attachments: [].map.call(files, file => ({
            contentType: getType(file.name) || 'application/octet-stream',
            contentUrl: file.url,
            name: file.name
          })),
          channelData: {
            attachmentSizes: [].map.call(files, file => file.size)
          },
          type: 'message'
        }));

        // TODO: [P4] Should we put this as an individual saga instead?
        yield put(stopSpeakingActivity());
      }
    );
  });
}
