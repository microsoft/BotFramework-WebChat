import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo } from 'react';

import useActivityElementMapRef from '../providers/ChatHistoryDOM/useActivityElementRef';
import ActivityRow from './ActivityRow';
import useRenderActivityProps from './hooks/useRenderActivityProps';

const { useGetKeyByActivity } = hooks;

type TranscriptActivityProps = Readonly<{
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

const TranscriptActivity = ({ activity, renderActivity }: TranscriptActivityProps) => {
  const activityElementMapRef = useActivityElementMapRef();
  const getKeyByActivity = useGetKeyByActivity();
  const { hideTimestamp, renderActivityStatus, renderAvatar, showCallout } = useRenderActivityProps(activity);

  const activityKey: string = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);

  const activityCallbackRef = useCallback(
    (activityElement: HTMLElement) => {
      activityElement
        ? activityElementMapRef.current.set(activityKey, activityElement)
        : activityElementMapRef.current.delete(activityKey);
    },
    [activityElementMapRef, activityKey]
  );

  const children = useMemo(
    () => renderActivity({ hideTimestamp, renderActivityStatus, renderAvatar, showCallout }),
    [renderActivity, hideTimestamp, renderActivityStatus, renderAvatar, showCallout]
  );

  return (
    <ActivityRow activity={activity} ref={activityCallbackRef}>
      {children}
    </ActivityRow>
  );
};

export default memo(TranscriptActivity);
export { type TranscriptActivityProps };
