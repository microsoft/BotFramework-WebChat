/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';

import { SENDING, SEND_FAILED, SENT } from '../types/internal/SendStatus';
import useGetKeyByActivity from '../hooks/useGetKeyByActivity';
import useSendStatusByActivityKey from '../hooks/useSendStatusByActivityKey';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

import type { ReactNode, VFC } from 'react';
import type { RenderActivityStatus } from '../types/ActivityStatusMiddleware';
import type { SendStatus } from '../types/internal/SendStatus';
import type { WebChatActivity } from 'botframework-webchat-core';

type ActivityStatusContainerCoreProps = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
  sendStatus: SendStatus;
};

const ActivityStatusContainerCore: VFC<ActivityStatusContainerCoreProps> = memo(
  ({ activity, hideTimestamp, nextVisibleActivity, sendStatus }) => {
    const { activityStatusRenderer: createActivityStatusRenderer }: { activityStatusRenderer: RenderActivityStatus } =
      useWebChatAPIContext();

    return createActivityStatusRenderer({
      activity,
      hideTimestamp,
      nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
      sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
      sendState: sendStatus === SEND_FAILED || sendStatus === SENT ? sendStatus : SENDING
    });
  }
);

ActivityStatusContainerCore.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    from: PropTypes.shape({ role: PropTypes.string }).isRequired,
    localTimestamp: PropTypes.string
  }).isRequired,
  hideTimestamp: PropTypes.bool.isRequired,
  nextVisibleActivity: PropTypes.any,
  sendStatus: PropTypes.oneOf([SENDING, SEND_FAILED, SENT])
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

    const sendStatus = (typeof key === 'string' && sendStatusByActivityKey.get(key)) || SENT;

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
  hideTimestamp: false,
  nextVisibleActivity: undefined
};

ActivityStatusContainer.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    from: PropTypes.shape({ role: PropTypes.string }).isRequired,
    localTimestamp: PropTypes.string
  }).isRequired,
  hideTimestamp: PropTypes.bool,
  nextVisibleActivity: PropTypes.any
};

type ActivityStatusRenderer = (renderOptions: {
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
}) => (props?: { hideTimestamp?: boolean }) => ReactNode;

export default function useCreateActivityStatusRenderer(): ActivityStatusRenderer {
  return useMemo<ActivityStatusRenderer>(
    () =>
      ({ activity, nextVisibleActivity }) =>
      ({ hideTimestamp } = {}) => (
        <ActivityStatusContainer
          activity={activity}
          hideTimestamp={hideTimestamp}
          nextVisibleActivity={nextVisibleActivity}
        />
      ),
    []
  );
}
