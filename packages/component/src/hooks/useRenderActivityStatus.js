import { Constants } from 'botframework-webchat-core';
import { useCallback, useContext, useMemo } from 'react';

import useGroupTimestamp from './useGroupTimestamp';
import useSendTimeoutForActivity from './useSendTimeoutForActivity';
import useTimePast from './internal/useTimePast';
import WebChatUIContext from '../WebChatUIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

function shouldGroupTimestamp(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities.
    return true;
  } else if (activityX && activityY && activityX.from && activityY.from) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    if (activityX.from.role === activityY.from.role) {
      const timeX = new Date(activityX.timestamp).getTime();
      const timeY = new Date(activityY.timestamp).getTime();

      return Math.abs(timeX - timeY) <= groupTimestamp;
    }
  }

  return false;
}

export default function useRenderActivityStatus({ activity, nextVisibleActivity }) {
  const { activityStatusRenderer } = useContext(WebChatUIContext);
  const [groupTimestamp] = useGroupTimestamp();
  const sendTimeout = useSendTimeoutForActivity(activity);

  const sameTimestampGroup = useMemo(() => shouldGroupTimestamp(activity, nextVisibleActivity, groupTimestamp), [
    activity,
    groupTimestamp,
    nextVisibleActivity
  ]);

  // SEND_FAILED from the activity is ignored, and is instead based on styleOptions.sendTimeout.
  // Note that the derived state is time-sensitive. The useTimePast() hook is used to make sure it changes over time.
  const {
    channelData: { clientTimestamp = 0, state } = {},
    from: { role }
  } = activity;
  const fromUser = role === 'user';
  const activitySent = state !== SENDING && state !== SEND_FAILED;
  const pastTimeout = useTimePast(fromUser && !activitySent ? new Date(clientTimestamp).getTime() + sendTimeout : 0);
  const sendState = fromUser ? (activitySent ? SENT : pastTimeout ? SEND_FAILED : SENDING) : SENT;

  return useCallback(() => activityStatusRenderer({ activity, nextVisibleActivity, sameTimestampGroup, sendState }), [
    activity,
    activityStatusRenderer,
    nextVisibleActivity,
    sameTimestampGroup,
    sendState
  ]);
}
