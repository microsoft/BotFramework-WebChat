import React, { memo, useCallback, useMemo } from 'react';
import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type ActivityElementMap } from './Transcript/types';
import { type MutableRefObject, type ReactNode } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';
import ActivityRow from './Transcript/ActivityRow';

const { useCreateActivityStatusRenderer } = hooks;

function TranscriptActivity({
  activityElementMapRef,
  activityKey,
  activity,
  hideTimestamp,
  renderActivity,
  renderAvatar,
  showCallout
}: Readonly<{
  activityElementMapRef: MutableRefObject<ActivityElementMap>;
  activityKey: string;
  activity: WebChatActivity;
  hideTimestamp: boolean;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
  showCallout: boolean;
}>) {
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const activityCallbackRef = useCallback(
    (activityElement: HTMLElement) => {
      activityElement
        ? activityElementMapRef.current.set(activityKey, activityElement)
        : activityElementMapRef.current.delete(activityKey);
    },
    [activityElementMapRef, activityKey]
  );

  const renderActivityStatus = useMemo(
    () =>
      createActivityStatusRenderer({
        activity,
        nextVisibleActivity: undefined
      }),
    [activity, createActivityStatusRenderer]
  );

  const children = useMemo(
    () =>
      renderActivity({
        hideTimestamp,
        renderActivityStatus,
        renderAvatar,
        showCallout
      }),
    [hideTimestamp, renderActivity, renderActivityStatus, renderAvatar, showCallout]
  );

  return (
    <ActivityRow activity={activity} ref={activityCallbackRef}>
      {children}
    </ActivityRow>
  );
}

export default memo(TranscriptActivity);
