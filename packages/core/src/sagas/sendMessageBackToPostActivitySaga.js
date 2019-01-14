import {
    put,
    take
  } from 'redux-saga/effects';

  import whileConnected from './effects/whileConnected';

  import { SEND_MESSAGE_BACK } from '../actions/sendMessageBack';
  import postActivity from '../actions/postActivity';

  export default function* () {
    yield whileConnected(function* () {
      for (;;) {
        const { payload: { displayText, text, value } } = yield takeEvery(SEND_MESSAGE_BACK);

        if (text || value) {
          yield put(postActivity({
            channelData: {
              messageBack: {
                displayText
              }
            },
            text,
            type: 'message',
            value
          }));
        }
      }
    });
  }
