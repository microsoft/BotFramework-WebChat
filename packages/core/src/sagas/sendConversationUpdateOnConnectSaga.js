import { put } from 'redux-saga/effects';
import whileConnected from './effects/whileConnected';

import postActivity from '../actions/postActivity';

export default function* () {
  yield whileConnected(sendConversationUpdateOnConnect);
}

function* sendConversationUpdateOnConnect(_, userID) {
  yield put(postActivity({
    type: 'conversationUpdate',
    membersAdded: [{
      id: userID
    }]
  }, 'code'));
}
