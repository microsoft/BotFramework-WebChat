import { put } from 'redux-saga/effects';

import connectionStatusUpdate from '../actions/connectionStatusUpdate';
import observeEach from './effects/observeEach';
import setReferenceGrammarID from '../actions/setReferenceGrammarID';
import whileConnected from './effects/whileConnected';

function* observeConnectionStatus({ directLine }) {
  yield observeEach(directLine.connectionStatus$, function* updateConnectionStatus(connectionStatus) {
    yield put(connectionStatusUpdate(connectionStatus));
    yield put(setReferenceGrammarID(directLine.referenceGrammarId));
  });
}

export default function* connectionStatusUpdateSaga() {
  yield whileConnected(observeConnectionStatus);
}
