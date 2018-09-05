import { fork } from 'redux-saga/effects';

import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import incomingTypingSaga from './sagas/incomingTypingSaga';
import postActivitySaga from './sagas/postActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendTypingOnSetSendBoxSaga from './sagas/sendTypingOnSetSendBoxSaga';
import speakActivitySaga from './sagas/speakActivitySaga';
import startSpeechInputAfterSpeakActivitySaga from './sagas/startSpeechInputAfterSpeakActivitySaga';
import stopSpeakActivityOnSpeechInputSaga from './sagas/stopSpeakActivityOnSpeechInputSaga';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* () {
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(incomingTypingSaga);
  yield fork(postActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendTypingOnSetSendBoxSaga);
  yield fork(speakActivitySaga);
  yield fork(startSpeechInputAfterSpeakActivitySaga);
  yield fork(stopSpeakActivityOnSpeechInputSaga);
  yield fork(submitSendBoxSaga);
}
