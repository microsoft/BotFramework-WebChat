import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { bridgeComponentPropsSchema, type BridgeComponentProps } from 'botframework-webchat-api/internal';
import React, { Fragment, memo, useMemo } from 'react';

import isZeroOrPositive from '../../../Utils/isZeroOrPositive';
import useFirstActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useLastActivity';
import useFirstActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useLastActivity';

const { useCreateActivityStatusRenderer, useCreateAvatarRenderer, useRenderAttachment, useStyleOptions } = hooks;

function LegacyActivityBridge(props: BridgeComponentProps) {
  const { activity, render } = validateProps(bridgeComponentPropsSchema, props);

  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [firstActivityInSenderGroup] = useFirstActivityInSenderGroup();
  const [firstActivityInStatusGroup] = useFirstActivityInStatusGroup();
  const [lastActivityInSenderGroup] = useLastActivityInSenderGroup();
  const [lastActivityInStatusGroup] = useLastActivityInStatusGroup();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const renderAttachment = useRenderAttachment();
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
    () =>
      createActivityStatusRenderer({
        activity,
        nextVisibleActivity: undefined
      }),
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

  const children = useMemo(
    () =>
      render(renderAttachment, {
        hideTimestamp,
        renderActivityStatus,
        renderAvatar: renderAvatarForSenderGroup,
        showCallout
      }),
    [hideTimestamp, render, renderActivityStatus, renderAttachment, renderAvatarForSenderGroup, showCallout]
  );

  return <Fragment>{children}</Fragment>;
}

export default memo(LegacyActivityBridge);
