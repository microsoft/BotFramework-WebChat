import {
  put
} from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import connectionStatusUpdate from '../actions/connectionStatusUpdate';
import setReferenceGrammarID from '../actions/setReferenceGrammarID';

export default function* () {
  yield whileConnected(observeConnectionStatus);
}

function* observeConnectionStatus({ directLine }) {
  yield observeEach(directLine.connectionStatus$, function* (connectionStatus) {
    yield put(connectionStatusUpdate(connectionStatus));
    yield put(setReferenceGrammarID(directLine.referenceGrammarId));
  });
}
