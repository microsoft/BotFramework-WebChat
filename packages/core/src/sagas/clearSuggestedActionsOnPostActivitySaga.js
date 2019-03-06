import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import setSuggestedActions from '../actions/setSuggestedActions';

export default function* () {
  yield whileConnected(clearSuggestedActionsOnPostActivity);
}

function* clearSuggestedActionsOnPostActivity() {
  yield takeEvery(
    ({ payload, type }) => (
      type === POST_ACTIVITY_PENDING
      && payload.activity.type === 'message'
    ),
    clearSuggestedActions
  );
}

function* clearSuggestedActions() {
  yield put(setSuggestedActions());
}
