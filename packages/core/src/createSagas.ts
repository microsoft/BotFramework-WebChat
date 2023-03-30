import { fork } from 'redux-saga/effects';

import clearSuggestedActionsOnPostActivitySaga from './sagas/clearSuggestedActionsOnPostActivitySaga';
import connectionStatusToNotificationSaga from './sagas/connectionStatusToNotificationSaga';
import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import detectSlowConnectionSaga from './sagas/detectSlowConnectionSaga';
import emitTypingIndicatorToPostActivitySaga from './sagas/emitTypingIndicatorToPostActivitySaga';
import markAllAsSpokenOnStopSpeakActivitySaga from './sagas/markAllAsSpokenOnStopSpeakActivitySaga';
import observeActivitySaga from './sagas/observeActivitySaga';
import postActivitySaga from './sagas/postActivitySaga';
import queueIncomingActivitySaga from './sagas/queueIncomingActivitySaga';
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

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';
import type { Saga } from 'redux-saga';

type CreateSagasOptions = {
  ponyfill: GlobalScopePonyfill;
};

export default function createSagas({ ponyfill }: CreateSagasOptions): Saga {
  return function* () {
    // TODO: [P2] Since fork() silently catches all exceptions, we need to find a way to console.error them out.

    yield fork(clearSuggestedActionsOnPostActivitySaga);
    yield fork(connectionStatusToNotificationSaga);
    yield fork(connectionStatusUpdateSaga);
    yield fork(connectSaga);
    yield fork(detectSlowConnectionSaga, ponyfill);
    yield fork(emitTypingIndicatorToPostActivitySaga);
    yield fork(markAllAsSpokenOnStopSpeakActivitySaga);
    yield fork(observeActivitySaga);
    yield fork(postActivitySaga, ponyfill);
    yield fork(queueIncomingActivitySaga, ponyfill);
    yield fork(sendEventToPostActivitySaga);
    yield fork(sendFilesToPostActivitySaga);
    yield fork(sendMessageBackToPostActivitySaga);
    yield fork(sendMessageToPostActivitySaga);
    yield fork(sendPostBackToPostActivitySaga);
    yield fork(sendTypingIndicatorOnSetSendBoxSaga, ponyfill);
    yield fork(speakActivityAndStartDictateOnIncomingActivityFromOthersSaga);
    yield fork(startDictateOnSpeakCompleteSaga);
    yield fork(startSpeakActivityOnPostActivitySaga);
    yield fork(stopDictateOnCardActionSaga);
    yield fork(stopSpeakingActivityOnInputSaga);
    yield fork(submitSendBoxSaga);
  };
}
