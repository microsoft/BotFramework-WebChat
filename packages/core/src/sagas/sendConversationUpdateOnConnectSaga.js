import { put } from 'redux-saga/effects';
import whileConnected from './effects/whileConnected';

import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(sendConversationUpdateOnConnect);
}

function* sendConversationUpdateOnConnect() {
  yield put(postActivity({
    type: 'conversationUpdate',
    membersAdded: []
  }, 'code'));
}
