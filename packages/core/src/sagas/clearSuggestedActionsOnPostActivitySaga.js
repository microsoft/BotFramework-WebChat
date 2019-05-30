import { put, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import whileConnected from './effects/whileConnected';

function* clearSuggestedActions() {
  yield put(setSuggestedActions());
}

function* clearSuggestedActionsOnPostActivity() {
  yield takeEvery(
    ({ payload, type }) => type === POST_ACTIVITY_PENDING && payload.activity.type === 'message',
    clearSuggestedActions
  );
}

export default function* clearSuggestedActionsOnPostActivitySaga() {
  yield whileConnected(clearSuggestedActionsOnPostActivity);
}
