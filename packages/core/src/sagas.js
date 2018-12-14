import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import incomingTypingSaga from './sagas/incomingTypingSaga';
import markActivityForSpeakSaga from './sagas/markActivityForSpeakSaga';
import markAllAsSpokenOnStopSpeakActivitySaga from './sagas/markAllAsSpokenOnStopSpeakActivitySaga';
import postActivitySaga from './sagas/postActivitySaga';
import sendEventToPostActivitySaga from './sagas/sendEventToPostActivitySaga';
import sendFilesToPostActivitySaga from './sagas/sendFilesToPostActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendPostBackToPostActivitySaga from './sagas/sendPostBackToPostActivitySaga';
import sendTypingOnSetSendBoxSaga from './sagas/sendTypingOnSetSendBoxSaga';
import startDictateAfterSpeakActivitySaga from './sagas/startDictateAfterSpeakActivitySaga';
import stopDictateOnCardAction from './sagas/stopDictateOnCardAction';
import stopSpeakActivityOnInputSaga from './sagas/stopSpeakActivityOnInputSaga';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* () {
  yield fork(clearSuggestedActionsOnPostActivitySaga);
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(incomingTypingSaga);
  yield fork(markActivityForSpeakSaga);
  yield fork(markAllAsSpokenOnStopSpeakActivitySaga);
  yield fork(postActivitySaga);
  yield fork(sendEventToPostActivitySaga);
  yield fork(sendFilesToPostActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendPostBackToPostActivitySaga);
  yield fork(sendTypingOnSetSendBoxSaga);
  yield fork(startDictateAfterSpeakActivitySaga);
  yield fork(stopDictateOnCardAction);
  yield fork(stopSpeakActivityOnInputSaga);
  yield fork(submitSendBoxSaga);
}
