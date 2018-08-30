import { fork } from 'redux-saga/effects';

import connectionStatusUpdateSaga from './sagas/connectionStatusUpdateSaga';
import connectSaga from './sagas/connectSaga';
import incomingActivitySaga from './sagas/incomingActivitySaga';
import incomignTypingSaga from './sagas/incomingTypingSaga';
import postActivitySaga from './sagas/postActivitySaga';

export default function* () {
  yield fork(connectionStatusUpdateSaga);
  yield fork(connectSaga);
  yield fork(incomingActivitySaga);
  yield fork(incomignTypingSaga);
  yield fork(postActivitySaga);
}
