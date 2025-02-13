import { put, select, takeEvery } from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import stopDictate from '../actions/stopDictate';
import { DICTATING } from '../constants/DictateState';
import dictateStateSelector from '../selectors/dictateState';
import whileConnected from './effects/whileConnected';

function* stopDictateOnCardAction() {
  // TODO: [P2] We should stop speech input when the user click on anything on a card, including open URL which doesn't generate postActivity
  //       This functionality was not implemented in v3
  yield takeEvery(
    // Currently, there are no actions that are related to card input
    // For now, we are using POST_ACTIVITY of a "message" activity
    // In the future, if we have an action for card input, we should use that instead
    ({ payload, type }) => type === POST_ACTIVITY_PENDING && payload.activity.type === 'message',
    function* putStopDictate() {
      const dictateState = yield select(dictateStateSelector);

      // In continuous mode (speech recognition is active) and it should not be stopped by performing card action.
      // Otherwise, stop dictation.
      if (dictateState !== DICTATING) {
        yield put(stopDictate());
      }
    }
  );
}

export default function* stopDictateOnCardActionSaga() {
  yield whileConnected(stopDictateOnCardAction);
}
