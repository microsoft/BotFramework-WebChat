import {
  put,
  take
} from 'redux-saga/effects';

import { POST_ACTIVITY_PENDING } from '../actions/postActivity';
import whileConnected from './effects/whileConnected';
import setSuggestedActions from '../actions/setSuggestedActions';

export default function* () {
  yield whileConnected(function* () {
    for (;;) {
      yield take(({ payload, type }) => type === POST_ACTIVITY_PENDING && payload.activity.type === 'message');
      yield put(setSuggestedActions());
    }
  });
}
