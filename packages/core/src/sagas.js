import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import detectSlowConnectionSaga from './sagas/detectSlowConnectionSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import markActivityForSpeakOnIncomingActivityFromOthersSaga from './sagas/markActivityForSpeakOnIncomingActivityFromOthersSaga';
import markAllAsSpokenOnStopSpeakActivitySaga from './sagas/markAllAsSpokenOnStopSpeakActivitySaga';
import postActivitySaga from './sagas/postActivitySaga';
import removeIncomingTypingAfterIntervalSaga from './sagas/removeIncomingTypingAfterIntervalSaga';
import sendEventToPostActivitySaga from './sagas/sendEventToPostActivitySaga';
import sendFilesToPostActivitySaga from './sagas/sendFilesToPostActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendMessageBackToPostActivitySaga from './sagas/sendMessageBackToPostActivitySaga';
import sendPostBackToPostActivitySaga from './sagas/sendPostBackToPostActivitySaga';
import sendTypingIndicatorOnSetSendBoxSaga from './sagas/sendTypingIndicatorOnSetSendBoxSaga';
import startDictateAfterSpeakActivitySaga from './sagas/startDictateAfterSpeakActivitySaga';
import startSpeakActivityOnPostActivitySaga from './sagas/startSpeakActivityOnPostActivitySaga';
import stopDictateOnCardActionSaga from './sagas/stopDictateOnCardActionSaga';
import stopSpeakingActivityOnInputSaga from './sagas/stopSpeakingActivityOnInputSaga';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* sagas() {
  // TODO: [P2] Since fork() silently catches all exceptions, we need to find a way to console.error them out.

  yield fork(clearSuggestedActionsOnPostActivitySaga);
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(detectSlowConnectionSaga);
  yield fork(incomingActivitySaga);
  yield fork(markActivityForSpeakOnIncomingActivityFromOthersSaga);
  yield fork(markAllAsSpokenOnStopSpeakActivitySaga);
  yield fork(postActivitySaga);
  yield fork(removeIncomingTypingAfterIntervalSaga);
  yield fork(sendEventToPostActivitySaga);
  yield fork(sendFilesToPostActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendMessageBackToPostActivitySaga);
  yield fork(sendPostBackToPostActivitySaga);
  yield fork(sendTypingIndicatorOnSetSendBoxSaga);
  yield fork(startDictateAfterSpeakActivitySaga);
  yield fork(startSpeakActivityOnPostActivitySaga);
  yield fork(stopDictateOnCardActionSaga);
  yield fork(stopSpeakingActivityOnInputSaga);
  yield fork(submitSendBoxSaga);
}
