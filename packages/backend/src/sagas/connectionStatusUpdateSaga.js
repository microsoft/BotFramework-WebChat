import {
  put
} from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import { CONNECTION_STATUS_UPDATE } from '../Actions/connectionStatusUpdate';

export default function* () {
  yield whileConnected(function* (directLine) {
    yield observeEach(directLine.connectionStatus$, function* (connectionStatus) {
      yield put({ type: CONNECTION_STATUS_UPDATE, payload: { connectionStatus } });
    });
  });
}
