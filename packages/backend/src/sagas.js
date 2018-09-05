import { fork } from 'redux-saga/effects';

import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import incomingTypingSaga from './sagas/incomingTypingSaga';
import postActivitySaga from './sagas/postActivitySaga';
import speakActivitySaga from './sagas/speakActivitySaga';
import startSpeechInputAfterSpeakActivitySaga from './sagas/startSpeechInputAfterSpeakActivitySaga';
import stopSpeakActivityOnSpeechInputSaga from './sagas/stopSpeakActivityOnSpeechInputSaga';

export default function* () {
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(incomingTypingSaga);
  yield fork(postActivitySaga);
  yield fork(speakActivitySaga);
  yield fork(startSpeechInputAfterSpeakActivitySaga);
  yield fork(stopSpeakActivityOnSpeechInputSaga);
}
