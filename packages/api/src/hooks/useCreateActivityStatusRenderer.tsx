/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import { Constants, DirectLineActivity } from 'botframework-webchat-core';
import React, { ReactNode, useMemo } from 'react';

import SendState from '../types/SendState';
import useGetSendTimeoutForActivity from './useGetSendTimeoutForActivity';
import useTimePassed from './internal/useTimePassed';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

const ActivityStatusContainer = ({ activity, hideTimestamp, nextVisibleActivity }) => {
  const { activityStatusRenderer: createActivityStatusRenderer } = useWebChatAPIContext();
  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();

  // SEND_FAILED from the activity is ignored, and is instead based on styleOptions.sendTimeout.
  // Note that the derived state is time-sensitive. The useTimePassed() hook is used to make sure it changes over time.
  const {
    channelData: { clientTimestamp = 0, state } = {},
    from: { role }
  }: {
    channelData: {
      clientTimestamp?: number;
      state?: SendState;
    };
    from: {
      role: string;
    };
  } = activity;

  const activitySent = state !== SENDING && state !== SEND_FAILED;
  const fromUser = role === 'user';
  const sendTimeout = getSendTimeoutForActivity({ activity });

  const pastTimeout = useTimePassed(fromUser && !activitySent ? new Date(clientTimestamp).getTime() + sendTimeout : 0);

  const sendState = activitySent || !fromUser ? SENT : pastTimeout ? SEND_FAILED : SENDING;

  return useMemo(
    () =>
      createActivityStatusRenderer({
        activity,
        hideTimestamp,
        nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
        sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
        sendState
      }),
    [activity, createActivityStatusRenderer, hideTimestamp, nextVisibleActivity, sendState]
  );
};

export default function useCreateActivityStatusRenderer(): (renderOptions: {
  activity: DirectLineActivity;
  nextVisibleActivity: DirectLineActivity;
}) => (props: { hideTimestamp?: boolean }) => ReactNode {
  return useMemo(
    () =>
      ({ activity, nextVisibleActivity }: { activity: DirectLineActivity; nextVisibleActivity: DirectLineActivity }) =>
      ({ hideTimestamp }: { hideTimestamp?: boolean } = {}) =>
        (
          <ActivityStatusContainer
            activity={activity}
            hideTimestamp={hideTimestamp}
            nextVisibleActivity={nextVisibleActivity}
          />
        ),
    []
  );
}
