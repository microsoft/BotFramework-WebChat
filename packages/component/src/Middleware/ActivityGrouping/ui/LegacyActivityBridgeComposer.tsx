import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import { LegacyActivityContextProvider, type LegacyActivityContextType } from 'botframework-webchat-api/internal';
import isZeroOrPositive from '../../../Utils/isZeroOrPositive';
import useFirstActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useFirstActivity';
import useLastActivityInSenderGroup from '../../ActivityGrouping/ui/SenderGrouping/useLastActivity';
import useFirstActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useFirstActivity';
import useLastActivityInStatusGroup from '../../ActivityGrouping/ui/StatusGrouping/useLastActivity';

const { useStyleOptions } = hooks;

const webChatActivitySchema = custom<WebChatActivity>(value => safeParse(object({}), value).success);

const legacyActivityComposerPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(reactNode())
  }),
  readonly()
);

type LegacyActivityBridgeComposerProps = InferInput<typeof legacyActivityComposerPropsSchema>;

/**
 * This component is for adding props to legacy activity middleware renderer for backward compatibility.
 * These props cannot be computed in `api` packages because they requires knowledge about activity grouping.
 *
 * @param props.activity The activity to be rendered by the legacy activity middleware.
 * @param props.children Actual rendering of the activity with the legacy activity middleware.
 * @returns A component that would add legacy props to legacy activity middleware renderer.
 */
function LegacyActivityBridgeComposer(props: LegacyActivityBridgeComposerProps) {
  const { activity, children } = validateProps(legacyActivityComposerPropsSchema, props);

  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [firstActivityInSenderGroup] = useFirstActivityInSenderGroup();
  const [firstActivityInStatusGroup] = useFirstActivityInStatusGroup();
  const [lastActivityInSenderGroup] = useLastActivityInSenderGroup();
  const [lastActivityInStatusGroup] = useLastActivityInStatusGroup();

  const hideAllTimestamps = groupTimestamp === false;
  const isFirstInSenderGroup =
    firstActivityInSenderGroup === activity || typeof firstActivityInSenderGroup === 'undefined';
  const isFirstInStatusGroup =
    firstActivityInStatusGroup === activity || typeof firstActivityInStatusGroup === 'undefined';
  const isLastInSenderGroup =
    lastActivityInSenderGroup === activity || typeof lastActivityInSenderGroup === 'undefined';
  const isLastInStatusGroup =
    lastActivityInStatusGroup === activity || typeof lastActivityInStatusGroup === 'undefined';
  const isTopSideBotNub = isZeroOrPositive(bubbleNubOffset);
  const isTopSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);

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
    () =>
      Object.freeze({
        hideTimestamp,
        showCallout
      }),
    [hideTimestamp, showCallout]
  );

  return <LegacyActivityContextProvider value={context}>{children}</LegacyActivityContextProvider>;
}

export default memo(LegacyActivityBridgeComposer);
