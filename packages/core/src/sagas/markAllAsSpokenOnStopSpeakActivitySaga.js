import { put, select, takeEvery } from 'redux-saga/effects';

import { of as activitiesOf } from '../selectors/activities';
import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import markActivity from '../actions/markActivity';
import speakingActivity from '../definitions/speakingActivity';

function* markAllAsSpoken() {
  const speakingActivities = yield select(activitiesOf(speakingActivity));

  for (const activity of speakingActivities) {
    yield put(markActivity(activity, 'speak', false));
  }
}

export default function* markAllAsSpokenOnStopSpeakActivitySaga() {
  yield takeEvery(STOP_SPEAKING_ACTIVITY, markAllAsSpoken);
}
