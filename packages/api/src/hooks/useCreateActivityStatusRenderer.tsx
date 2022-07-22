/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';

import useGetKeyByActivity from '../hooks/useGetKeyByActivity';
import useSendStatusByActivityKey from '../hooks/useSendStatusByActivityKey';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

import type { ReactNode, VFC } from 'react';
import type { SendStatus } from '../providers/ActivitySendStatus/SendStatus';
import type { WebChatActivity } from 'botframework-webchat-core';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

type InnerActivityStatusContainerProps = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
  sendStatus: SendStatus;
};

const ActivityStatusContainerCore: VFC<InnerActivityStatusContainerProps> = memo(
  ({ activity, hideTimestamp, nextVisibleActivity, sendStatus }) => {
    const { activityStatusRenderer: createActivityStatusRenderer } = useWebChatAPIContext();

    // TODO: [P*] `createActivityStatusRenderer` should not be optional, check `useWebChatAPIContext`.
    return createActivityStatusRenderer({
      activity,
      hideTimestamp,
      // TODO: [P*] Remove deprecated.
      nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
      sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
      sendState: sendStatus === 'sending' ? SENDING : sendStatus === 'send failed' ? SEND_FAILED : SENT
    });
  }
);

ActivityStatusContainerCore.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    channelData: PropTypes.shape({ state: PropTypes.string }),
    from: PropTypes.shape({ role: PropTypes.string }).isRequired,
    localTimestamp: PropTypes.string
  }).isRequired,
  hideTimestamp: PropTypes.bool.isRequired,
  nextVisibleActivity: PropTypes.any,
  sendStatus: PropTypes.oneOf(['sending', 'send failed', 'sent'])
};

type ActivityStatusContainerProps = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
};

const ActivityStatusContainer: VFC<ActivityStatusContainerProps> = memo(
  ({ activity, hideTimestamp, nextVisibleActivity }) => {
    const [sendStatusByActivityKey] = useSendStatusByActivityKey();
    const getKeyByActivity = useGetKeyByActivity();

    const key = getKeyByActivity(activity);

    const sendStatus = (typeof key === 'string' && sendStatusByActivityKey.get(key)) || 'sent';

    return (
      <ActivityStatusContainerCore
        activity={activity}
        hideTimestamp={hideTimestamp}
        nextVisibleActivity={nextVisibleActivity}
        sendStatus={sendStatus}
      />
    );
  }
);

ActivityStatusContainer.defaultProps = {
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
  hideTimestamp: PropTypes.bool.isRequired,
  nextVisibleActivity: PropTypes.any
};

type ActivityStatusRenderer = (renderOptions: {
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
}) => (props: { hideTimestamp?: boolean }) => ReactNode;

export default function useCreateActivityStatusRenderer(): ActivityStatusRenderer {
  return useMemo<ActivityStatusRenderer>(
    () =>
      ({ activity, nextVisibleActivity }) =>
      ({ hideTimestamp }) =>
        (
          <ActivityStatusContainer
            activity={activity}
            hideTimestamp={hideTimestamp || false}
            nextVisibleActivity={nextVisibleActivity}
          />
        ),
    []
  );
}
