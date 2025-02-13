import { put, select, takeEvery } from 'redux-saga/effects';

import { MARK_ACTIVITY } from '../actions/markActivity';
import { SET_DICTATE_STATE } from '../actions/setDictateState';
import startDictate from '../actions/startDictate';
import { WILL_START } from '../constants/DictateState';
import speakingActivity from '../definitions/speakingActivity';
import { of as activitiesOf } from '../selectors/activities';
import dictateStateSelector from '../selectors/dictateState';

function* startDictateOnSpeakComplete() {
  const speakingActivities = yield select(activitiesOf(speakingActivity));
  const dictateState = yield select(dictateStateSelector);

  if (dictateState === WILL_START && !speakingActivities.length) {
    yield put(startDictate());
  }
}

// TODO: [P4] We should turn this into a reducer instead
export default function* startDictateOnSpeakCompleteSaga() {
  yield takeEvery(({ type }) => type === MARK_ACTIVITY || type === SET_DICTATE_STATE, startDictateOnSpeakComplete);
}
