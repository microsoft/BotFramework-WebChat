import { VOICE_POST_ACTIVITY } from '../../actions/postVoiceActivity';
import languageSelector from '../../selectors/language';
import createVoiceActivity from '../../services/private/createVoiceActivity';
import { is } from '../private/effects';
import type { Machine } from '../types';

/**
 * `postVoiceActivitySaga`: while online, posts each voice activity, fire and forget: no echo, no send status, not
 * kept (thousands of audio chunks).
 */
const postVoiceActivityMachine: Machine = scope =>
  scope.whileOnline(({ directLine, userID, username }, online) =>
    online.on(is(VOICE_POST_ACTIVITY), ({ payload: { activity } }, worker) => {
      const locale: string = worker.select(languageSelector);
      const outgoingActivity = createVoiceActivity({
        activity,
        locale,
        now: new worker.ponyfill.Date(),
        userID,
        username
      });
      const failed = (error: unknown) =>
        console.error('botframework-webchat: Failed to post voice activity to chat adapter.', error);

      try {
        worker.observeOnce(directLine.postActivity(outgoingActivity), () => undefined, failed);
      } catch (error) {
        failed(error);
      }
    })
  );

export default postVoiceActivityMachine;
