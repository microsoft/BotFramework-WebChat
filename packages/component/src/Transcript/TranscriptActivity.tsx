import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo } from 'react';
import { custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import useFirstActivityInSenderGroup from '../Middleware/ActivityGrouping/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../Middleware/ActivityGrouping/ui/SenderGrouping/useLastActivity';
import useFirstActivityInStatusGroup from '../Middleware/ActivityGrouping/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../Middleware/ActivityGrouping/ui/StatusGrouping/useLastActivity';
import useActivityElementMapRef from '../providers/ChatHistoryDOM/useActivityElementRef';
import useGetRenderActivityCallback from '../providers/RenderingActivities/useGetRenderActivityCallback';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ActivityRow from './ActivityRow';

const { useCreateActivityStatusRenderer, useCreateAvatarRenderer, useGetKeyByActivity, useStyleOptions } = hooks;

const transcriptActivityPropsSchema = pipe(
  object({
    activity: custom<WebChatActivity>(value => safeParse(object({}), value).success)
  }),
  readonly()
);

type TranscriptActivityProps = InferInput<typeof transcriptActivityPropsSchema>;

const TranscriptActivity = (props: TranscriptActivityProps) => {
  const { activity } = validateProps(transcriptActivityPropsSchema, props);
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [firstActivityInSenderGroup] = useFirstActivityInSenderGroup();
  const [firstActivityInStatusGroup] = useFirstActivityInStatusGroup();
  const [lastActivityInSenderGroup] = useLastActivityInSenderGroup();
  const [lastActivityInStatusGroup] = useLastActivityInStatusGroup();
  const activityElementMapRef = useActivityElementMapRef();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const getKeyByActivity = useGetKeyByActivity();
  const getRenderActivityCallback = useGetRenderActivityCallback();
  const renderAvatar = useCreateAvatarRenderer();

  const activityKey: string = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);
  const hideAllTimestamps = groupTimestamp === false;
  const isFirstInSenderGroup =
    firstActivityInSenderGroup === activity || typeof firstActivityInSenderGroup === 'undefined';
  const isFirstInStatusGroup =
    firstActivityInStatusGroup === activity || typeof firstActivityInStatusGroup === 'undefined';
  const isLastInSenderGroup =
    lastActivityInSenderGroup === activity || typeof lastActivityInSenderGroup === 'undefined';
  const isLastInStatusGroup =
    lastActivityInStatusGroup === activity || typeof lastActivityInStatusGroup === 'undefined';
  const renderAvatarForSenderGroup = useMemo(
    () => !!renderAvatar && renderAvatar({ activity }),
    [activity, renderAvatar]
  );
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

  const renderActivity = getRenderActivityCallback(activity);

  const children = useMemo(
    () =>
      renderActivity({
        hideTimestamp,
        renderActivityStatus,
        renderAvatar: renderAvatarForSenderGroup,
        showCallout
      }),
    [hideTimestamp, renderActivity, renderActivityStatus, renderAvatarForSenderGroup, showCallout]
  );

  return (
    <ActivityRow activity={activity} ref={activityCallbackRef}>
      {children}
    </ActivityRow>
  );
};

export default memo(TranscriptActivity);
export { type TranscriptActivityProps };
