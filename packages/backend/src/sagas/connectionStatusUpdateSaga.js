import {
  put
} from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import whileConnected from './effects/whileConnected';

import { CONNECTION_STATUS_UPDATE } from '../Actions/connectionStatusUpdate';
import { SET_REFERENCE_GRAMMAR_ID } from '../Actions/setReferenceGrammarId';

export default function* () {
  yield whileConnected(function* (directLine) {
    yield observeEach(directLine.connectionStatus$, function* (connectionStatus) {
      yield put({ type: CONNECTION_STATUS_UPDATE, payload: { connectionStatus } });
      yield put({ type: SET_REFERENCE_GRAMMAR_ID, payload: { referenceGrammarId: directLine.referenceGrammarId } });
    });
  });
}
