import { Constants } from 'botframework-webchat-core';
import { useContext, useMemo } from 'react';

import useSendTimeoutForActivity from './useSendTimeoutForActivity';
import WebChatUIContext from '../WebChatUIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

export default function useCreateActivityStatusRenderer() {
  const { activityStatusRenderer } = useContext(WebChatUIContext);

  // TODO: We used to call useTimePassed. We need a newer implementation
  const getSendTimeout = useSendTimeoutForActivity();

  return useMemo(
    () => ({ activity, nextVisibleActivity } = legacyArgs) => {
      const sendTimeout = getSendTimeout({ activity });

      // SEND_FAILED from the activity is ignored, and is instead based on styleOptions.sendTimeout.
      // Note that the derived state is time-sensitive. The useTimePassed() hook is used to make sure it changes over time.
      const {
        channelData: { clientTimestamp = 0, state } = {},
        from: { role }
      } = activity;
      const fromUser = role === 'user';
      const activitySent = state !== SENDING && state !== SEND_FAILED;
      const pastTimeout = fromUser && !activitySent ? new Date(clientTimestamp).getTime() + sendTimeout : 0;
      const sendState = activitySent || !fromUser ? SENT : pastTimeout ? SEND_FAILED : SENDING;

      return activityStatusRenderer({
        activity,
        nextVisibleActivity,
        sameTimestampGroup: false,
        sendState
      });
    },
    [activityStatusRenderer, getSendTimeout]
  );
}
