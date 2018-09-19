import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import incomingTypingSaga from './sagas/incomingTypingSaga';
import markActivityForSpeakSaga from './sagas/markActivityForSpeakSaga';
import postActivitySaga from './sagas/postActivitySaga';
import sendFilesToPostActivitySaga from './sagas/sendFilesToPostActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendTypingOnSetSendBoxSaga from './sagas/sendTypingOnSetSendBoxSaga';
import startSpeechInputAfterSpeakActivitySaga from './sagas/startSpeechInputAfterSpeakActivitySaga';
import stopSpeakActivityOnInputSaga from './sagas/stopSpeakActivityOnInputSaga';
import stopSpeechInputOnCardAction from './sagas/stopSpeechInputOnCardAction';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* () {
  yield fork(clearSuggestedActionsOnPostActivitySaga);
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(incomingTypingSaga);
  yield fork(markActivityForSpeakSaga);
  yield fork(postActivitySaga);
  yield fork(sendFilesToPostActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendTypingOnSetSendBoxSaga);
  yield fork(startSpeechInputAfterSpeakActivitySaga);
  yield fork(stopSpeakActivityOnInputSaga);
  yield fork(stopSpeechInputOnCardAction);
  yield fork(submitSendBoxSaga);
}
