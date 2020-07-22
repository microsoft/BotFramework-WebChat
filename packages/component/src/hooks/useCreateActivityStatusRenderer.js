import { Constants } from 'botframework-webchat-core';
import { useContext, useMemo } from 'react';

import useSendTimeoutForActivity from './useSendTimeoutForActivity';
import WebChatUIContext from '../WebChatUIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

let showUpgradeNotes = true;

export default function useCreateActivityStatusRenderer() {
  const { activityStatusRenderer: createActivityStatusRenderer } = useContext(WebChatUIContext);

  // TODO: We used to call useTimePassed. We need a newer implementation
  const getSendTimeout = useSendTimeoutForActivity();

  return useMemo(
    () => ({ activity, hideTimestamp, nextVisibleActivity }) => {
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

      const renderActivityStatus = createActivityStatusRenderer({
        activity,
        hideTimestamp,
        nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
        sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
        sendState
      });

      if (typeof renderActivityStatus === 'object') {
        if (showUpgradeNotes) {
          console.warn(
            'botframework-webchat: Please update your custom activity status middleware to return a render function, instead of a React element.'
          );

          showUpgradeNotes = false;
        }

        return () => renderActivityStatus;
      }

      return renderActivityStatus;
    },
    [createActivityStatusRenderer, getSendTimeout]
  );
}
