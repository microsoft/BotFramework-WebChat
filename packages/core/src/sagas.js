import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusToNotificationSaga from './sagas/connectionStatusToNotificationSaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import detectSlowConnectionSaga from './sagas/detectSlowConnectionSaga';
import emitTypingIndicatorToPostActivitySaga from './sagas/emitTypingIndicatorToPostActivitySaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import markAllAsSpokenOnStopSpeakActivitySaga from './sagas/markAllAsSpokenOnStopSpeakActivitySaga';
import postActivitySaga from './sagas/postActivitySaga';
import sendEventToPostActivitySaga from './sagas/sendEventToPostActivitySaga';
import sendFilesToPostActivitySaga from './sagas/sendFilesToPostActivitySaga';
import sendMessageBackToPostActivitySaga from './sagas/sendMessageBackToPostActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendPostBackToPostActivitySaga from './sagas/sendPostBackToPostActivitySaga';
import sendTypingIndicatorOnSetSendBoxSaga from './sagas/sendTypingIndicatorOnSetSendBoxSaga';
import speakActivityAndStartDictateOnIncomingActivityFromOthersSaga from './sagas/speakActivityAndStartDictateOnIncomingActivityFromOthersSaga';
import startDictateOnSpeakCompleteSaga from './sagas/startDictateOnSpeakCompleteSaga';
import startSpeakActivityOnPostActivitySaga from './sagas/startSpeakActivityOnPostActivitySaga';
import stopDictateOnCardActionSaga from './sagas/stopDictateOnCardActionSaga';
import stopSpeakingActivityOnInputSaga from './sagas/stopSpeakingActivityOnInputSaga';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* sagas() {
  // TODO: [P2] Since fork() silently catches all exceptions, we need to find a way to console.error them out.

  yield fork(clearSuggestedActionsOnPostActivitySaga);
  yield fork(connectionStatusToNotificationSaga);
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(detectSlowConnectionSaga);
  yield fork(emitTypingIndicatorToPostActivitySaga);
  yield fork(incomingActivitySaga);
  yield fork(markAllAsSpokenOnStopSpeakActivitySaga);
  yield fork(postActivitySaga);
  yield fork(sendEventToPostActivitySaga);
  yield fork(sendFilesToPostActivitySaga);
  yield fork(sendMessageBackToPostActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendPostBackToPostActivitySaga);
  yield fork(sendTypingIndicatorOnSetSendBoxSaga);
  yield fork(speakActivityAndStartDictateOnIncomingActivityFromOthersSaga);
  yield fork(startDictateOnSpeakCompleteSaga);
  yield fork(startSpeakActivityOnPostActivitySaga);
  yield fork(stopDictateOnCardActionSaga);
  yield fork(stopSpeakingActivityOnInputSaga);
  yield fork(submitSendBoxSaga);
}
