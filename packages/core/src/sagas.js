import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import markActivityForSpeakOnIncomingActivityFromOthersSaga from './sagas/markActivityForSpeakOnIncomingActivityFromOthersSaga';
import markAllAsSpokenOnStopSpeakActivitySaga from './sagas/markAllAsSpokenOnStopSpeakActivitySaga';
import postActivitySaga from './sagas/postActivitySaga';
import removeIncomingTypingAfterIntervalSaga from './sagas/removeIncomingTypingAfterIntervalSaga';
import sendConversationUpdateOnConnectSaga from './sagas/sendConversationUpdateOnConnectSaga';
import sendEventToPostActivitySaga from './sagas/sendEventToPostActivitySaga';
import sendFilesToPostActivitySaga from './sagas/sendFilesToPostActivitySaga';
import sendMessageToPostActivitySaga from './sagas/sendMessageToPostActivitySaga';
import sendMessageBackToPostActivitySaga from './sagas/sendMessageBackToPostActivitySaga';
import sendPostBackToPostActivitySaga from './sagas/sendPostBackToPostActivitySaga';
import sendTypingOnSetSendBoxSaga from './sagas/sendTypingOnSetSendBoxSaga';
import startDictateAfterSpeakActivitySaga from './sagas/startDictateAfterSpeakActivitySaga';
import startSpeakActivityOnPostActivitySaga from './sagas/startSpeakActivityOnPostActivitySaga';
import stopDictateOnCardActionSaga from './sagas/stopDictateOnCardActionSaga';
import stopSpeakingActivityOnInputSaga from './sagas/stopSpeakingActivityOnInputSaga';
import submitSendBoxSaga from './sagas/submitSendBoxSaga';

export default function* () {
  yield fork(clearSuggestedActionsOnPostActivitySaga);
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(markActivityForSpeakOnIncomingActivityFromOthersSaga);
  yield fork(markAllAsSpokenOnStopSpeakActivitySaga);
  yield fork(postActivitySaga);
  yield fork(removeIncomingTypingAfterIntervalSaga);
  yield fork(sendConversationUpdateOnConnectSaga);
  yield fork(sendEventToPostActivitySaga);
  yield fork(sendFilesToPostActivitySaga);
  yield fork(sendMessageToPostActivitySaga);
  yield fork(sendMessageBackToPostActivitySaga);
  yield fork(sendPostBackToPostActivitySaga);
  yield fork(sendTypingOnSetSendBoxSaga);
  yield fork(startDictateAfterSpeakActivitySaga);
  yield fork(startSpeakActivityOnPostActivitySaga);
  yield fork(stopDictateOnCardActionSaga);
  yield fork(stopSpeakingActivityOnInputSaga);
  yield fork(submitSendBoxSaga);
}
