import { VOICE_POST_ACTIVITY } from '../../actions/postVoiceActivity';
import languageSelector from '../../selectors/language';
import type { DirectLineActivity } from '../../types/external/DirectLineActivity';
import dateToLocaleISOString from '../../utils/dateToLocaleISOString';
import { is } from '../private/effects';
import type { Machine } from '../types';

/**
 * While online, posts each voice activity.
 *
 * Unlike `postActivityMachine`, this machine:
 * - Does NOT wait for echo back
 * - Does NOT store activity in Redux
 * - Does NOT dispatch PENDING/FULFILLED/REJECTED actions
 * - Fire and forget - just send to WebSocket
 *
 * This prevents memory leaks from storing thousands of voice chunks.
 */
const postVoiceActivityMachine: Machine = scope =>
  scope.whileOnline(({ directLine, userID, username }, online) =>
    online.on(is(VOICE_POST_ACTIVITY), ({ payload: { activity } }, worker) => {
      const locale: string = worker.select(languageSelector);
      const localTimeZone =
        typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new worker.ponyfill.Date();

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
              value: activity.value
            }
          : {})
      };

      const failed = (error: unknown) =>
        console.error('botframework-webchat: Failed to post voice activity to chat adapter.', error);

      try {
        worker.observeOnce(directLine.postActivity(outgoingActivity as DirectLineActivity), () => undefined, failed);
      } catch (error) {
        failed(error);
      }
    })
  );

export default postVoiceActivityMachine;
