import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import { STOP_SPEAKING_ACTIVITY } from '../actions/stopSpeakingActivity';
import markActivity from '../actions/markActivity';

import speakingActivity from '../definitions/speakingActivity';

import { of as activitiesOf } from '../selectors/activities';

export default function* () {
  yield takeEvery(STOP_SPEAKING_ACTIVITY, markAllAsSpoken);
}

function* markAllAsSpoken() {
  const speakingActivities = yield select(activitiesOf(speakingActivity));

  for (let activity of speakingActivities) {
    yield put(markActivity(activity, 'speak', false));
  }
}
