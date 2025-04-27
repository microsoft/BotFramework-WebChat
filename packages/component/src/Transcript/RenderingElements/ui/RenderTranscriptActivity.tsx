import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import TranscriptActivity from '../../../TranscriptActivity';
import isZeroOrPositive from '../../../Utils/isZeroOrPositive';
import useActivityElementMapRef from '../useActivityElementRef';
import useFirstActivityInSenderGroup from './SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from './SenderGrouping/useLastActivity';
import useRenderAvatar from './SenderGrouping/useRenderAvatar';
import useFirstActivityInStatusGroup from './StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from './StatusGrouping/useLastActivity';

const { useGetKeyByActivity, useStyleOptions } = hooks;

type RenderTranscriptActivityProps = Readonly<{
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

const RenderTranscriptActivity = ({ activity, renderActivity }: RenderTranscriptActivityProps) => {
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const activityElementMapRef = useActivityElementMapRef();
  const getKeyByActivity = useGetKeyByActivity();
  const isFirstInSenderGroup = useFirstActivityInSenderGroup()[0] === activity;
  const isFirstInStatusGroup = useFirstActivityInStatusGroup()[0] === activity;
  const isLastInSenderGroup = useLastActivityInSenderGroup()[0] === activity;
  const isLastInStatusGroup = useLastActivityInStatusGroup()[0] === activity;
  const isTopSideBotNub = isZeroOrPositive(bubbleNubOffset);
  const isTopSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);
  const key: string = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);
  const renderAvatar = useRenderAvatar();

  const hideAllTimestamps = groupTimestamp === false;
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

  // console.log({
  //   renderAvatar,
  //   showCallout,
  //   isFirstInSenderGroup,
  //   isFirstInStatusGroup,
  //   isLastInSenderGroup,
  //   isLastInStatusGroup
  // });

  return (
    <TranscriptActivity
      activity={activity}
      activityElementMapRef={activityElementMapRef}
      // "hideTimestamp" is a render-time parameter for renderActivityStatus().
      // If true, it will hide the timestamp, but it will continue to show the
      // retry prompt. And show the screen reader version of the timestamp.
      activityKey={key}
      hideTimestamp={hideAllTimestamps || !isLastInSenderGroup}
      key={key}
      renderActivity={renderActivity}
      renderAvatar={renderAvatar}
      showCallout={showCallout}
    />
  );
};

RenderTranscriptActivity.displayName = 'RenderTranscriptActivity';

export default memo(RenderTranscriptActivity);
