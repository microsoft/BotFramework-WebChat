import { put, select, takeEvery } from 'redux-saga/effects';

import { MARK_ACTIVITY } from '../../lib/actions/markActivity';
import { of as activitiesOf } from '../selectors/activities';
import { SET_DICTATE_STATE } from '../../lib/actions/setDictateState';
import { WILL_START } from '../constants/DictateState';
import dictateStateSelector from '../selectors/dictateState';
import speakingActivity from '../definitions/speakingActivity';
import startDictate from '../actions/startDictate';

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
