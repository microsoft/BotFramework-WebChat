import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';

import updateIn from 'simple-update-in';
import whileConnected from './effects/whileConnected';

import upsertActivity, { UPSERT_ACTIVITY } from '../actions/upsertActivity';

function observableToPromise(observable) {
  return new Promise((resolve, reject) => {
    const subscription = observable.subscribe(result => {
      // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe
      //       Need to wait some short time here to make sure the subscription variable has setup
      setImmediate(() => subscription.unsubscribe());
      resolve(result);
    }, reject);
  });
}

async function getSessionId(directLine) {
  try {
    return directLine.getSessionId ? await observableToPromise(directLine.getSessionId()) : Promise.resolve();
  } catch (err) {
    return Promise.resolve();
  }
}

export default function* () {
  yield whileConnected(function* (directLine) {
    // We fetch session ID asynchronously to make sure if the call is slower than the first UPSERT_ACTIVITY, we won't miss the first few activites.
    const sessionIdPromise = getSessionId(directLine);

    // In this saga, we are going to patch OAuth card to prime the "&code_challenge" into the card.
    // We moved the code from UI to here because it makes sense to prime it nomatter what UI the dev is using.
    yield takeLatest(UPSERT_ACTIVITY, function* ({ payload: { activity } }) {
      const sessionId = yield call(() => sessionIdPromise);
      const nextActivity = updateIn(
        activity,
        [
          'attachments',
          attachment => attachment && attachment.contentType === 'application/vnd.microsoft.card.oauth',
          'content',
          'buttons',
          button => button.type === 'signin'
        ],
        button => ({
          ...button,
          // After the conversion, we will change it to "openUrl"
          // This will also make sure this loop is not called indefinitely
          type: 'openUrl',
          value: sessionId ? `${ button.value }&code_challenge=${ sessionId }` : button.value
        })
      );

      if (activity !== nextActivity) {
        yield put(upsertActivity(nextActivity));
      }
    });
  });
}
