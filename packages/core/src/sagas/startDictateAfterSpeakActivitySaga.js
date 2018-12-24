import {
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';
import whileSpeakIncomingActivity from './effects/whileSpeakIncomingActivity';

import { MARK_ACTIVITY } from '../actions/markActivity';
import startDictate from '../actions/startDictate';

export default function* () {
  yield whileConnected(function* () {
    yield whileSpeakIncomingActivity(startDictateAfterSpeakActivitySaga);
  });
}

function* startDictateAfterSpeakActivitySaga() {
  yield takeEvery(
    ({ payload, type }) => (
      type === MARK_ACTIVITY
      && payload.name === 'speak'
      && payload.value === false
    ),
    function* ({ payload: { activityID } }) {
      const { activities } = yield select();
      const activity = activities.find(({ id }) => id === activityID);

      if (
        activity.inputHint !== 'ignoringInput'
        // Checks if there are no more activities that will be synthesis
        && !activities.some(
          ({ channelData, id }) => id !== activityID && channelData && channelData.speak === true
        )
      ) {
        // We honor input hint based on this article
        // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-input-hints?view=azure-bot-service-4.0&tabs=cs
        yield put(startDictate());
      }
    }
  );
}
