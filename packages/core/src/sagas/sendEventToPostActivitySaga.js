import {
  put,
  takeEvery
} from 'redux-saga/effects';

import whileConnected from './effects/whileConnected';

import { SEND_EVENT } from '../actions/sendEvent';
import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(function* () {
    yield takeEvery(
      ({ payload, type }) =>
        type === SEND_EVENT
        && payload
        && payload.name,
      function* ({ payload: { name, value } }) {
        yield put(postActivity({
          name,
          type: 'event',
          value
        }));
      }
    );
  });
}
