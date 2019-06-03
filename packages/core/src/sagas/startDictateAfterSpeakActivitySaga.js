import { put, select, takeEvery } from 'redux-saga/effects';

import { MARK_ACTIVITY } from '../actions/markActivity';
import selectActivities from '../selectors/activities';
import speakingActivity from '../definitions/speakingActivity';
import startDictate from '../actions/startDictate';
import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

function* startDictateAfterAllActivitiesSpoken({ payload: { activityID } }) {
  const activities = yield select(selectActivities);
  const [spokenActivity] = activities;

  if (
    spokenActivity &&
    spokenActivity.inputHint !== 'ignoringInput' &&
    // Checks if there are no more activities that will be synthesis
    !activities.some(activity => activity.id !== activityID && speakingActivity(activity))
  ) {
    // We honor input hint based on this article
    // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-input-hints?view=azure-bot-service-4.0&tabs=cs
    yield put(startDictate());
  }
}

function* startDictateAfterSpeakActivity() {
  yield takeEvery(
    ({ payload, type }) => type === MARK_ACTIVITY && payload.name === 'speak' && payload.value === false,
    startDictateAfterAllActivitiesSpoken
  );
}

export default function* startDictateAfterSpeakActivitySaga() {
  yield whileConnected(function* startDictateAfterSpeakActivityWhileConnected() {
    yield whileSpeakIncomingActivity(startDictateAfterSpeakActivity);
  });
}
