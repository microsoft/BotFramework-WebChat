import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { useMemo, type ReactNode } from 'react';

import useFirstActivityInSenderGroup from '../../Middleware/ActivityGrouping/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../../Middleware/ActivityGrouping/ui/SenderGrouping/useLastActivity';
import useFirstActivityInStatusGroup from '../../Middleware/ActivityGrouping/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../../Middleware/ActivityGrouping/ui/StatusGrouping/useLastActivity';
import isZeroOrPositive from '../../Utils/isZeroOrPositive';

const { useCreateActivityStatusRenderer, useCreateAvatarRenderer, useStyleOptions } = hooks;

type RenderActivityProps = {
  hideTimestamp: boolean;
  renderActivityStatus: ((options: { hideTimestamp: boolean }) => ReactNode) | undefined;
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>) | undefined;
  showCallout: boolean;
};

const useRenderActivityProps = (activity: WebChatActivity): RenderActivityProps => {
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [firstActivityInSenderGroup] = useFirstActivityInSenderGroup();
  const [firstActivityInStatusGroup] = useFirstActivityInStatusGroup();
  const [lastActivityInSenderGroup] = useLastActivityInSenderGroup();
  const [lastActivityInStatusGroup] = useLastActivityInStatusGroup();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const renderAvatar = useCreateAvatarRenderer();

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
    () => createActivityStatusRenderer({ activity }),
    [activity, createActivityStatusRenderer]
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

  return {
    hideTimestamp,
    renderActivityStatus,
    renderAvatar: renderAvatarForSenderGroup,
    showCallout
  };
};

export default useRenderActivityProps;
