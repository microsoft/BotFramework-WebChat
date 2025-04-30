import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo } from 'react';

import useActivityElementMapRef from '../providers/ChatHistoryDOM/useActivityElementRef';
import useFirstActivityInSenderGroup from '../providers/GroupedRenderingActivities/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../providers/GroupedRenderingActivities/ui/SenderGrouping/useLastActivity';
import useRenderAvatar from '../providers/GroupedRenderingActivities/ui/SenderGrouping/useRenderAvatar';
import useFirstActivityInStatusGroup from '../providers/GroupedRenderingActivities/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../providers/GroupedRenderingActivities/ui/StatusGrouping/useLastActivity';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ActivityRow from './ActivityRow';

const { useCreateActivityStatusRenderer, useGetKeyByActivity, useStyleOptions } = hooks;

type TranscriptActivityProps = Readonly<{
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

const TranscriptActivity = ({ activity, renderActivity }: TranscriptActivityProps) => {
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const activityElementMapRef = useActivityElementMapRef();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const getKeyByActivity = useGetKeyByActivity();
  const isFirstInSenderGroup = useFirstActivityInSenderGroup()[0] === activity;
  const isFirstInStatusGroup = useFirstActivityInStatusGroup()[0] === activity;
  const isLastInSenderGroup = useLastActivityInSenderGroup()[0] === activity;
  const isLastInStatusGroup = useLastActivityInStatusGroup()[0] === activity;
  const renderAvatar = useRenderAvatar();

  const activityKey: string = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);
  const hideAllTimestamps = groupTimestamp === false;
  const isTopSideBotNub = isZeroOrPositive(bubbleNubOffset);
  const isTopSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);
  const renderActivityStatus = useMemo(
    () =>
      createActivityStatusRenderer({
        activity,
        nextVisibleActivity: undefined
      }),
    [activity, createActivityStatusRenderer]
  );

  const activityCallbackRef = useCallback(
    (activityElement: HTMLElement) => {
      activityElement
        ? activityElementMapRef.current.set(activityKey, activityElement)
        : activityElementMapRef.current.delete(activityKey);
    },
    [activityElementMapRef, activityKey]
  );
  const hideTimestamp = hideAllTimestamps || !isLastInStatusGroup;
  const isTopSideNub = activity.from?.role === 'user' ? isTopSideUserNub : isTopSideBotNub;

  let showCallout: boolean;

  // Depending on the "showAvatarInGroup" setting, the avatar will render in different positions.
  if (showAvatarInGroup === 'sender') {
    if (isTopSideNub) {
      showCallout = isFirstInSenderGroup && isFirstInStatusGroup;
    } else {
      showCallout = isLastInSenderGroup && isLastInStatusGroup;
    }
  } else if (showAvatarInGroup === 'status') {
    if (isTopSideNub) {
      showCallout = isFirstInStatusGroup;
    } else {
      showCallout = isLastInStatusGroup;
    }
  } else {
    showCallout = true;
  }

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
};

export default memo(TranscriptActivity);
export { type TranscriptActivityProps };
