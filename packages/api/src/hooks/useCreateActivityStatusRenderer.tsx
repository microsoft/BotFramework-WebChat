/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import PropTypes from 'prop-types';
import React, { type ReactNode, memo, useMemo } from 'react';

import { SENDING, SEND_FAILED, SENT } from '../types/internal/SendStatus';
import useGetKeyByActivity from '../hooks/useGetKeyByActivity';
import useSendStatusByActivityKey from '../hooks/useSendStatusByActivityKey';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

import { type RenderActivityStatus } from '../types/ActivityStatusMiddleware';
import { type SendStatus } from '../types/internal/SendStatus';
import { type WebChatActivity } from 'botframework-webchat-core';

type ActivityStatusContainerCoreProps = Readonly<{
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
  sendStatus: SendStatus;
}>;

const ActivityStatusContainerCoreInner = ({
  activity,
  hideTimestamp,
  nextVisibleActivity,
  sendStatus
}: ActivityStatusContainerCoreProps): ReactNode => {
  const { activityStatusRenderer: createActivityStatusRenderer }: { activityStatusRenderer: RenderActivityStatus } =
    useWebChatAPIContext();

  return createActivityStatusRenderer({
    activity,
    hideTimestamp,
    nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
    sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
    sendState: sendStatus === SEND_FAILED || sendStatus === SENT ? sendStatus : SENDING
  });
};

ActivityStatusContainerCoreInner.propTypes = {
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

const ActivityStatusContainerCore = memo(ActivityStatusContainerCoreInner);

type ActivityStatusContainerProps = Readonly<{
  activity: WebChatActivity;
  hideTimestamp: boolean;
  nextVisibleActivity: WebChatActivity;
}>;

const ActivityStatusContainerInner = ({
  activity,
  hideTimestamp,
  nextVisibleActivity
}: ActivityStatusContainerProps): ReactNode => {
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
};

ActivityStatusContainerInner.defaultProps = {
  hideTimestamp: false,
  nextVisibleActivity: undefined
};

ActivityStatusContainerInner.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    from: PropTypes.shape({ role: PropTypes.string }).isRequired,
    localTimestamp: PropTypes.string
  }).isRequired,
  hideTimestamp: PropTypes.bool,
  nextVisibleActivity: PropTypes.any
};

const ActivityStatusContainer = memo(ActivityStatusContainerInner);

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
