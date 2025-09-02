/* eslint react/prop-types: "off" */
/* eslint react/require-default-props: "off" */

import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';

import useGetKeyByActivity from '../hooks/useGetKeyByActivity';
import useSendStatusByActivityKey from '../hooks/useSendStatusByActivityKey';
import { type RenderActivityStatus } from '../types/ActivityStatusMiddleware';
import { type SendStatus } from '../types/SendStatus';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

type ActivityStatusContainerCoreProps = Readonly<{
  activity: WebChatActivity;
  hideTimestamp: boolean;
  sendStatus: SendStatus;
}>;

const ActivityStatusContainerCore = memo(
  ({ activity, hideTimestamp, sendStatus }: ActivityStatusContainerCoreProps) => {
    const { activityStatusRenderer: createActivityStatusRenderer }: { activityStatusRenderer: RenderActivityStatus } =
      useWebChatAPIContext();

    return createActivityStatusRenderer({
      activity,
      hideTimestamp,
      sendState: sendStatus === 'send failed' || sendStatus === 'sent' ? sendStatus : 'sending'
    });
  }
);

type ActivityStatusContainerProps = Readonly<{
  activity: WebChatActivity;
  hideTimestamp: boolean;
}>;

const ActivityStatusContainer = memo(({ activity, hideTimestamp }: ActivityStatusContainerProps) => {
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const getKeyByActivity = useGetKeyByActivity();

  const key = getKeyByActivity(activity);

  const sendStatus = (typeof key === 'string' && sendStatusByActivityKey.get(key)) || 'sent';

  return <ActivityStatusContainerCore activity={activity} hideTimestamp={hideTimestamp} sendStatus={sendStatus} />;
});

export type ActivityStatusRenderer = (renderOptions: {
  activity: WebChatActivity;
}) => (props?: { hideTimestamp?: boolean }) => ReactNode;

export default function useCreateActivityStatusRenderer(): ActivityStatusRenderer {
  return useMemo<ActivityStatusRenderer>(
    () =>
      ({ activity }) =>
      ({ hideTimestamp } = {}) => <ActivityStatusContainer activity={activity} hideTimestamp={hideTimestamp} />,
    []
  );
}
