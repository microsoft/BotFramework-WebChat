import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_EVENT } from '../actions/sendEvent';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(SEND_EVENT, function* ({ payload: { name, value } }) {
      if (name) {
        yield put(postActivity({
          name,
          type: 'event',
          value
        }));
      }
    });
  });
}
