import { put } from 'redux-saga/effects';

import postActivity from '../actions/postActivity';
import whileConnected from './effects/whileConnected';

export default function* () {
  yield whileConnected(sendConversationUpdateOnConnect);
}

function* sendConversationUpdateOnConnect({ userID, username }) {
  yield put(postActivity({
    type: 'conversationUpdate',
    membersAdded: [{
      id: userID,
      name: username
    }]
  }, 'code'));
}
