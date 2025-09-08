import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, useState, type MouseEventHandler } from 'react';
import {
  any,
  array,
  minLength,
  object,
  optional,
  parse,
  pipe,
  readonly,
  string,
  transform,
  type InferOutput
} from 'valibot';

import usePartGroupingLogicalGroup from './usePartGroupingLogicalGroup';
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

import styles from './PartGroupingActivity.module.css';

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
    children: optional(reactNode()),
    className: optional(string()),
    groupKey: string()
  }),
  readonly()
);

type FocusablePartGroupingActivityProps = InferOutput<typeof partGroupingFocusableActivityPropsSchema>;

function FocusablePartGroupingActivity(props: FocusablePartGroupingActivityProps) {
  const [activeDescendantId] = useActiveDescendantId();
  const { activity, children, className, groupKey } = parse(partGroupingFocusableActivityPropsSchema, props);

  const getGroupDescendantIdByActivityKey = useGetGroupDescendantIdByActivityKey();
  const focusByGroupKey = useFocusByGroupKey();

  const getKeyByActivity = useGetKeyByActivity();
  const groupingActivityDescendantId = getGroupDescendantIdByActivityKey(getKeyByActivity(activity));

  const focusSelf = useCallback<(withFocus?: boolean) => void>(
    (withFocus?: boolean) => focusByGroupKey(groupKey, withFocus),
    [groupKey, focusByGroupKey]
  );

  // When a child of the group receives focus, notify the transcript to set the `aria-activedescendant` to this activity.
  const handleDescendantFocus: () => void = useCallback(() => focusSelf(false), [focusSelf]);

  // When receive Escape key from descendant, focus back to the group.
  const handleLeaveFocusTrap = useCallback(() => focusSelf(), [focusSelf]);

  // When the user press UP/DOWN arrow keys, we put a visual focus indicator around the focused group.
  // We should do the same for mouse, when the user click on the activity, we should also put a visual focus indicator around the activity.
  // We are doing it in event capture phase to prevent descendants from stopping event propagation to us.
  const handleMouseDownCapture: MouseEventHandler = useCallback(() => focusSelf(false), [focusSelf]);

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
    <TranscriptFocusContent
      className={className}
      focused={isActiveDescendant}
      onMouseDownCapture={handleMouseDownCapture}
      ref={groupCallbackRef}
      role="article"
    >
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
  const classNames = useStyles(styles);
  const { activities, children } = parse(partGroupingActivityPropsSchema, props);
  const getKeyByActivity = useGetKeyByActivity();
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const messages = useMemo(
    () => activities.map(activity => getOrgSchemaMessage(activity.entities)).filter(message => !!message),
    [activities]
  );
  // eslint-disable-next-line no-magic-numbers
  const lastMessage = messages.at(-1);

  const activityKeys = useMemo(
    () => activities.map(activity => getKeyByActivity(activity)),
    [activities, getKeyByActivity]
  );

  const groupKey = usePartGroupingLogicalGroup({
    activityKeys,
    isCollapsed: !isGroupOpen
  });

  const firstActivity = activities.at(0);
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1);

  const currentMessage = useMemo(
    () => messages.toReversed().find(message => message.creativeWorkStatus === 'incomplete') || lastMessage,
    [messages, lastMessage]
  );

  const { renderAvatar, showCallout } = useRenderActivityProps(firstActivity);
  const { renderActivityStatus, hideTimestamp } = useRenderActivityProps(lastActivity);
  const [{ initials: botInitials }] = useAvatarForBot();

  const hasAvatar = botInitials || typeof botInitials === 'string';
  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const [{ bubbleNubOffset }] = useStyleOptions();

  const topAlignedCallout = isZeroOrPositive(bubbleNubOffset);

  return (
    <FocusablePartGroupingActivity
      activity={firstActivity}
      className={classNames['part-grouping-activity']}
      groupKey={groupKey}
    >
      <StackedLayoutRoot
        hideAvatar={hasAvatar && !showAvatar}
        isGroup={true}
        showAvatar={showAvatar}
        topCallout={topAlignedCallout}
      >
        <StackedLayoutMain avatar={showAvatar && renderAvatar && renderAvatar()}>
          <CollapsibleGrouping isOpen={isGroupOpen} onToggle={setIsGroupOpen} title={currentMessage?.abstract || ''}>
            <TranscriptActivityList className={classNames['part-grouping-activity__activities']}>
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
