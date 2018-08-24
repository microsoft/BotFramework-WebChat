import {
  put
} from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import upsertActivity from '../Actions/upsertActivity';

export default function* () {
  yield whileConnected(function* (directLine) {
    yield observeEach(directLine.activity$, function* (activity) {
      yield put(upsertActivity(activity));
    });
  });
}
