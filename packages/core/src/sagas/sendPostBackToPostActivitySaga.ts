// This is for the ternary operator of text and value.
/* eslint no-undefined: "off" */

import { put, takeEvery } from 'redux-saga/effects';
import postActivity from '../actions/postActivity';
import type sendPostBack from '../actions/sendPostBack';
import { SEND_POST_BACK } from '../actions/sendPostBack';
import whileConnected from './effects/whileConnected';

type PostBackActivity = {
  channelData: { postBack: true };
  replyToId?: string;
  type: 'message';
} & ({ text: string } | { value: any });

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
function* postActivityWithPostBack({ payload: { replyToId, value } }: ReturnType<typeof sendPostBack>) {
  yield put(
    postActivity({
      ...(typeof replyToId === 'undefined' ? {} : { replyToId }),
      channelData: { postBack: true },
      text: typeof value === 'string' ? value : undefined,
      type: 'message',
      value: typeof value !== 'string' ? value : undefined
    } satisfies PostBackActivity as any)
  );
}

function* sendPostBackToPostActivity() {
  yield takeEvery(SEND_POST_BACK, postActivityWithPostBack);
}

export default function* sendPostBackToPostActivitySaga() {
  yield whileConnected(sendPostBackToPostActivity);
}
