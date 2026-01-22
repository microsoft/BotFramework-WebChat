import { select, takeEvery } from 'redux-saga/effects';
import { VOICE_POST_ACTIVITY } from '../actions/voiceActivityActions';
import languageSelector from '../selectors/language';
import dateToLocaleISOString from '../utils/dateToLocaleISOString';
import whileConnected from './effects/whileConnected';
import observeOnce from './effects/observeOnce';

import type { DirectLineJSBotConnection } from '../types/external/DirectLineJSBotConnection';
import type { DirectLineActivity } from '../types/external/DirectLineActivity';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { VoicePostActivityAction } from '../actions/voiceActivityActions';

/**
 * Saga for handling outgoing voice activities.
 *
 * Unlike regular postActivitySaga, this saga:
 * - Does NOT wait for echo back
 * - Does NOT store activity in Redux
 * - Does NOT dispatch PENDING/FULFILLED/REJECTED actions
 * - Fire and forget - just send to WebSocket
 *
 * This prevents memory leaks from storing thousands of voice chunks.
 */
function* postVoiceActivity(
  directLine: DirectLineJSBotConnection,
  userID: string,
  username: string,
  { payload: { activity } }: VoicePostActivityAction,
  ponyfill: GlobalScopePonyfill
) {
  const locale: string = yield select(languageSelector);
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new ponyfill.Date();

  const outgoingActivity = {
    ...activity,
    channelId: 'webchat',
    from: {
      id: userID,
      name: username,
      role: 'user'
    },
    locale,
    localTimestamp: dateToLocaleISOString(now),
    localTimezone: localTimeZone,
    ...(activity.type === 'event'
      ? {
          name: activity.name,
          value: activity.value,
          payload: activity.payload
        }
      : {})
  };

  try {
    yield observeOnce(directLine.postActivity(outgoingActivity as DirectLineActivity));
  } catch (error) {
    console.error('botframework-webchat: Failed to post voice activity to chat adapter.', error);
  }
}

export default function* voiceActivitySaga(ponyfill: GlobalScopePonyfill) {
  yield whileConnected(function* voiceActivityWhileConnected({
    directLine,
    userID,
    username
  }: {
    directLine: DirectLineJSBotConnection;
    userID: string;
    username: string;
  }) {
    yield takeEvery(VOICE_POST_ACTIVITY, function* (action: VoicePostActivityAction) {
      yield* postVoiceActivity(directLine, userID, username, action, ponyfill);
    });
  });
}
