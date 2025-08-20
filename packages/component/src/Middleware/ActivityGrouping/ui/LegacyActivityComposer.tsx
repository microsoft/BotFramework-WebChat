import type { LegacyRenderAttachment } from '@msinternal/botframework-webchat-middleware/legacy';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { createContext, memo, useMemo } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import isZeroOrPositive from '../../../Utils/isZeroOrPositive';
import useFirstActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useLastActivity';
import useFirstActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useLastActivity';

const { useCreateActivityStatusRenderer, useCreateAvatarRenderer, useRenderAttachment, useStyleOptions } = hooks;

const webChatActivitySchema = custom<WebChatActivity>(value => safeParse(object({}), value).success);

const legacyActivityComposerPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(reactNode())
  }),
  readonly()
);

type LegacyActivityComposerProps = InferInput<typeof legacyActivityComposerPropsSchema>;

type LegacyActivityContextType = {
  readonly hideTimestamp: boolean;
  readonly renderActivityStatus: ReturnType<ReturnType<typeof useCreateActivityStatusRenderer>>;
  readonly renderAttachment: LegacyRenderAttachment;
  readonly renderAvatar: false | ReturnType<ReturnType<typeof useCreateAvatarRenderer>>;
  readonly showCallout: boolean;
};

const LegacyActivityContext = createContext<LegacyActivityContextType>({
  hideTimestamp: false,
  renderActivityStatus: undefined,
  renderAttachment: undefined,
  renderAvatar: undefined,
  showCallout: false
});

function LegacyActivityComposer(props: LegacyActivityComposerProps) {
  const { activity, children } = validateProps(legacyActivityComposerPropsSchema, props);

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

  const context = useMemo<LegacyActivityContextType>(
    () => ({
      hideTimestamp,
      renderActivityStatus,
      renderAttachment,
      renderAvatar: renderAvatarForSenderGroup,
      showCallout
    }),
    [hideTimestamp, renderActivityStatus, renderAttachment, renderAvatarForSenderGroup, showCallout]
  );

  return <LegacyActivityContext.Provider value={context}>{children}</LegacyActivityContext.Provider>;
}

// TODO: Move this under its own folder.
export default memo(LegacyActivityComposer);
export { LegacyActivityContext, LegacyActivityContextType };
