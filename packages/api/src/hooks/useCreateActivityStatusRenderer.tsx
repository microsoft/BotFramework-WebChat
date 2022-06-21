/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { ReactNode, useMemo, VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useGetSendTimeoutForActivity from './useGetSendTimeoutForActivity';
import useTimePassed from './internal/useTimePassed';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

type ActivityStatusContainerProps = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
};

const ActivityStatusContainer: VFC<ActivityStatusContainerProps> = ({
  activity,
  hideTimestamp,
  nextVisibleActivity
}) => {
  const { activityStatusRenderer: createActivityStatusRenderer } = useWebChatAPIContext();
  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();

  // SEND_FAILED from the activity is ignored, and is instead based on styleOptions.sendTimeout.
  // Note that the derived state is time-sensitive. The useTimePassed() hook is used to make sure it changes over time.
  const {
    from: { role }
  }: WebChatActivity = activity;

  const fromUser = role === 'user';
  let activitySent: boolean;
  let sendTimeoutAt: number;

  if (fromUser) {
    const state = activity.channelData?.state;
    const sendTimeout = getSendTimeoutForActivity({ activity });

    activitySent = state !== SENDING && state !== SEND_FAILED;

    // If no timestamp, we assume the "sending" will be timed out as "send failed".
    sendTimeoutAt = !activitySent
      ? new Date(activity.localTimestamp || new Date(0).toISOString()).getTime() + sendTimeout
      : 0;
  } else {
    activitySent = true;
    sendTimeoutAt = 0;
  }

  const pastTimeout = useTimePassed(sendTimeoutAt);

  const sendState = activitySent ? SENT : pastTimeout ? SEND_FAILED : SENDING;

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

ActivityStatusContainer.defaultProps = {
  hideTimestamp: false,
  nextVisibleActivity: undefined
};

ActivityStatusContainer.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    channelData: PropTypes.shape({ state: PropTypes.string }),
    from: PropTypes.shape({ role: PropTypes.string }).isRequired,
    localTimestamp: PropTypes.string
  }).isRequired,
  hideTimestamp: PropTypes.bool,
  nextVisibleActivity: PropTypes.any
};

export default function useCreateActivityStatusRenderer(): (renderOptions: {
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
}) => (props: { hideTimestamp?: boolean }) => ReactNode {
  return useMemo(
    () =>
      ({ activity, nextVisibleActivity }: { activity: WebChatActivity; nextVisibleActivity: WebChatActivity }) =>
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
