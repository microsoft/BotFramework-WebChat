import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { array, minLength, object, optional, pipe, readonly, transform, any, parse, type InferOutput } from 'valibot';

import usePartGroupingLogicalGroup, { getPartGropKey } from './usePartGroupingLogicalGroup';
import CollapsibleGrouping from '../CollapsibleGrouping';
import useActivityElementMapRef from '../../../../../providers/ChatHistoryDOM/useActivityElementRef';
import StackedLayoutMain from '../../../../../Activity/StackedLayoutMain';
import StackedLayoutRoot from '../../../../../Activity/StackedLayoutRoot';
import StackedLayoutStatus from '../../../../../Activity/StackedLayoutStatus';
import useActiveDescendantId from '../../../../../providers/TranscriptFocus/useActiveDescendantId';
import useGetGroupDescendantIdByActivityKey from '../../../../../providers/TranscriptFocus/useGetGroupDescendantIdByActivityKey';
import {
  TranscriptFocusContent,
  TranscriptFocusContentOverlay,
  TranscriptFocusContentActiveDescendant,
  TranscriptFocusIndicator
} from '../../../../../Transcript/TranscriptFocus';
import useFocusByGroupKey from '../../../../../providers/TranscriptFocus/useFocusByGroupKey';
import FocusTrap from '../../../../../Transcript/FocusTrap';
import useRenderActivityProps from '../../../../../Transcript/hooks/useRenderActivityProps';
import isZeroOrPositive from '../../../../../Utils/isZeroOrPositive';
import { android } from '../../../../../Utils/detectBrowser';
import TranscriptActivityList from '../../../../../Transcript/TranscriptFocus/TranscriptActivityList';

const { useAvatarForBot, useStyleOptions, useGetKeyByActivity } = hooks;

const partGroupingActivityPropsSchema = pipe(
  object({
    activities: pipe(
      array(
        pipe(
          any(),
          transform(value => value as WebChatActivity)
        )
      ),
      minLength(1, 'botframework-webchat: "activities" must have at least 1 activity'),
      readonly()
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type PartGroupingActivityProps = InferOutput<typeof partGroupingActivityPropsSchema>;

const partGroupingFocusableActivityPropsSchema = pipe(
  object({
    activity: pipe(
      any(),
      transform(value => value as WebChatActivity),
      readonly()
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type FocusablePartGroupingActivityProps = InferOutput<typeof partGroupingFocusableActivityPropsSchema>;

function FocusablePartGroupingActivity(props: FocusablePartGroupingActivityProps) {
  const [activeDescendantId] = useActiveDescendantId();
  const { activity, children } = parse(partGroupingFocusableActivityPropsSchema, props);

  const getGroupDescendantIdByActivityKey = useGetGroupDescendantIdByActivityKey();
  const focusByGroupKey = useFocusByGroupKey();

  const getKeyByActivity = useGetKeyByActivity();
  const groupingActivityDescendantId = getGroupDescendantIdByActivityKey(getKeyByActivity(activity));

  const groupKey = useMemo(() => getPartGropKey(getKeyByActivity(activity)), [getKeyByActivity, activity]);

  const focusSelf = useCallback<(withFocus?: boolean) => void>(
    (withFocus?: boolean) => focusByGroupKey(groupKey, withFocus),
    [groupKey, focusByGroupKey]
  );

  // When a child of the activity receives focus, notify the transcript to set the `aria-activedescendant` to this activity.
  const handleDescendantFocus: () => void = useCallback(() => focusSelf(false), [focusSelf]);

  // When receive Escape key from descendant, focus back to the activity.
  const handleLeaveFocusTrap = useCallback(() => focusSelf(), [focusSelf]);

  const isActiveDescendant = groupingActivityDescendantId === activeDescendantId;

  const activityElementMapRef = useActivityElementMapRef();

  const groupCallbackRef = useCallback(
    (activityElement: HTMLElement) => {
      activityElement
        ? activityElementMapRef.current.set(groupKey, activityElement)
        : activityElementMapRef.current.delete(groupKey);
    },
    [activityElementMapRef, groupKey]
  );

  return (
    <TranscriptFocusContent focused={isActiveDescendant} ref={groupCallbackRef}>
      <FocusTrap
        onFocus={handleDescendantFocus}
        onLeave={handleLeaveFocusTrap}
        targetClassName="webchat__basic-transcript__group-focus-target"
      >
        {children}
      </FocusTrap>
      <TranscriptFocusContentOverlay>
        {!android && <TranscriptFocusContentActiveDescendant id={groupingActivityDescendantId} />}
        <TranscriptFocusIndicator type="content" />
      </TranscriptFocusContentOverlay>
    </TranscriptFocusContent>
  );
}

function PartGroupingActivity(props: PartGroupingActivityProps) {
  const { activities, children } = parse(partGroupingActivityPropsSchema, props);
  const getKeyByActivity = useGetKeyByActivity();
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const activityKeys = useMemo(
    () => activities.map(activity => getKeyByActivity(activity)),
    [activities, getKeyByActivity]
  );

  const { shouldSkipRender } = usePartGroupingLogicalGroup({
    activityKeys,
    isGroupOpen
  });

  const firstActivity = activities.at(0);
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1);

  const lastMessage = useMemo(
    () =>
      getOrgSchemaMessage(
        (
          activities
            .toReversed()
            .find(
              activity => 'streamType' in activity.channelData && activity.channelData.streamType === 'informative'
            ) || lastActivity
        )?.entities
      ),
    [activities, lastActivity]
  );

  const { renderAvatar, showCallout } = useRenderActivityProps(firstActivity);
  const { renderActivityStatus, hideTimestamp } = useRenderActivityProps(lastActivity);
  const [{ initials: botInitials }] = useAvatarForBot();

  const hasAvatar = botInitials || typeof botInitials === 'string';
  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const [{ bubbleNubOffset }] = useStyleOptions();

  const topAlignedCallout = isZeroOrPositive(bubbleNubOffset);

  // Skip render if this is the initial grouping setup
  if (shouldSkipRender) {
    return null;
  }

  return (
    <FocusablePartGroupingActivity activity={firstActivity}>
      <StackedLayoutRoot
        hideAvatar={hasAvatar && !showAvatar}
        isGroup={true}
        showAvatar={showAvatar}
        topCallout={topAlignedCallout}
      >
        <StackedLayoutMain avatar={showAvatar && renderAvatar && renderAvatar()}>
          <CollapsibleGrouping isOpen={isGroupOpen} onToggle={setIsGroupOpen} title={lastMessage?.abstract || ''}>
            <TranscriptActivityList>
              {children}
            </TranscriptActivityList>
          </CollapsibleGrouping>
        </StackedLayoutMain>
        {renderActivityStatus && <StackedLayoutStatus>{renderActivityStatus({ hideTimestamp })}</StackedLayoutStatus>}
      </StackedLayoutRoot>
    </FocusablePartGroupingActivity>
  );
}

PartGroupingActivity.displayName = 'PartGroupingActivity';

export default memo(PartGroupingActivity);
export { type PartGroupingActivityProps };
