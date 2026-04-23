import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useCallback, useMemo, useState, type MouseEventHandler } from 'react';
import cx from 'classnames';
import {
  array,
  custom,
  minLength,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferOutput
} from 'valibot';

import StackedLayoutMain from '../../../../../Activity/StackedLayoutMain';
import StackedLayoutMessageStatus from '../../../../../Activity/StackedLayoutMessageStatus';
import StackedLayoutRoot from '../../../../../Activity/StackedLayoutRoot';
import StackedLayoutStatus from '../../../../../Activity/StackedLayoutStatus';
import useActivityElementMapRef from '../../../../../providers/ChatHistoryDOM/useActivityElementRef';
import useActiveDescendantId from '../../../../../providers/TranscriptFocus/useActiveDescendantId';
import useFocusByGroupKey from '../../../../../providers/TranscriptFocus/useFocusByGroupKey';
import useGetGroupDescendantIdByActivityKey from '../../../../../providers/TranscriptFocus/useGetGroupDescendantIdByActivityKey';
import FocusTrap from '../../../../../Transcript/FocusTrap';
import useRenderActivityProps from '../../../../../Transcript/hooks/useRenderActivityProps';
import {
  TranscriptActivityList,
  TranscriptFocusContent,
  TranscriptFocusContentActiveDescendant,
  TranscriptFocusContentOverlay,
  TranscriptFocusIndicator
} from '../../../../../Transcript/TranscriptFocus';
import { android } from '../../../../../Utils/detectBrowser';
import isZeroOrPositive from '../../../../../Utils/isZeroOrPositive';
import CollapsibleGrouping from '../CollapsibleGrouping';
import CollapsibleGroupingList from '../CollapsibleGroupingList';
import CollapsibleGroupingTitle from '../CollapsibleGroupingTitle';
import usePartGroupingLogicalGroup from './usePartGroupingLogicalGroup';

import styles from './PartGroupingActivity.module.css';

const { useAvatarForBot, useGetKeyByActivity, useLocalizer, useStyleOptions } = hooks;

const partGroupingActivityPropsSchema = pipe(
  object({
    activities: pipe(
      array(pipe(custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success))),
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
    activity: custom<WebChatActivity>(value => safeParse(object({}), value).success),
    children: optional(reactNode()),
    className: optional(string()),
    groupKey: string()
  }),
  readonly()
);

type FocusablePartGroupingActivityProps = InferOutput<typeof partGroupingFocusableActivityPropsSchema>;

// eslint-disable-next-line prefer-arrow-callback
const FocusablePartGroupingActivity = memo(function FocusablePartGroupingActivity(
  props: FocusablePartGroupingActivityProps
) {
  const { activity, children, className, groupKey } = validateProps(partGroupingFocusableActivityPropsSchema, props);

  const [activeDescendantId] = useActiveDescendantId();

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
});

function PartGroupingActivity(props: PartGroupingActivityProps) {
  const localize = useLocalizer();
  const { activities, children } = validateProps(partGroupingActivityPropsSchema, props);

  const classNames = useStyles(styles);
  const getKeyByActivity = useGetKeyByActivity();
  const [{ partGroupDefaultOpen }] = useStyleOptions();
  const [isGroupOpen, setIsGroupOpen] = useState(partGroupDefaultOpen);

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
    () => messages.find(message => message.creativeWorkStatus[0] === 'Incomplete') || lastMessage,
    [messages, lastMessage]
  );

  const { renderAvatar, showCallout } = useRenderActivityProps(firstActivity);
  const { renderActivityStatus, hideTimestamp } = useRenderActivityProps(lastActivity);
  const [{ initials: botInitials }] = useAvatarForBot();

  const hasAvatar = botInitials || typeof botInitials === 'string';
  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const [{ bubbleNubOffset }] = useStyleOptions();

  const topAlignedCallout = isZeroOrPositive(bubbleNubOffset);

  // The HowTo entity (the group root) may carry an explicit `creativeWorkStatus` and `abstract`.
  // When present, it takes precedence over status derived from individual messages.
  const [howToAbstract, howToStatus] = useMemo<[string | undefined, string | undefined]>(() => {
    const howTo = messages.find(message => message.isPartOf[0]?.creativeWorkStatus)?.isPartOf[0];

    return [howTo?.abstract[0], howTo?.creativeWorkStatus[0]];
  }, [messages]);

  const defaultWorkStatus = useMemo<'Incomplete' | undefined>(
    () => (messages.some(message => 'creativeWorkStatus' in message) ? 'Incomplete' : undefined),
    [messages]
  );

  // Group status resolution:
  // 1. If the HowTo entity has an explicit `creativeWorkStatus`, use it.
  // 2. Otherwise, derive from the active message: find the first 'Incomplete' message's status.
  // 3. Fall back to `defaultWorkStatus` which is 'Incomplete' if any message has a `creativeWorkStatus` property.
  const currentGroupStatus: string | undefined =
    howToStatus || currentMessage?.creativeWorkStatus[0] || defaultWorkStatus;

  /**
   * The idea behind group header is that it displays the state of the entire group:
   * - We first check if the HowTo entity (isPartOf) has an explicit `creativeWorkStatus`.
   * - If it does, we use it directly as the group status.
   * - Otherwise, we derive status from messages: find the active 'Incomplete' message.
   * - For the title we check if the current group status is 'Incomplete'.
   * - If it is 'Incomplete', we show the abstract of the first message with 'Incomplete' status.
   * - If not, we fall back to a default title.
   */
  const groupHeader = useMemo(
    () => (
      <Fragment>
        {(howToStatus || defaultWorkStatus) && (
          <StackedLayoutMessageStatus
            className={classNames['part-grouping-activity__message-status']}
            creativeWorkStatus={currentGroupStatus}
          />
        )}
        <CollapsibleGroupingTitle>
          {currentGroupStatus === 'Incomplete' || howToAbstract
            ? howToAbstract || currentMessage?.abstract || localize('COLLAPSIBLE_GROUPING_TITLE')
            : localize('COLLAPSIBLE_GROUPING_TITLE')}
        </CollapsibleGroupingTitle>
      </Fragment>
    ),
    [classNames, currentGroupStatus, currentMessage?.abstract, defaultWorkStatus, howToAbstract, howToStatus, localize]
  );

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
          <CollapsibleGrouping
            className={cx(classNames['part-grouping-activity__collapsible'], {
              [classNames['part-grouping-activity__collapsible--open']]: isGroupOpen
            })}
            header={groupHeader}
            isOpen={isGroupOpen}
            onToggle={setIsGroupOpen}
          >
            <CollapsibleGroupingList
              className={classNames['part-grouping-activity__activities']}
              tag={TranscriptActivityList}
            >
              {children}
            </CollapsibleGroupingList>
          </CollapsibleGrouping>
        </StackedLayoutMain>
        {renderActivityStatus && <StackedLayoutStatus>{renderActivityStatus({ hideTimestamp })}</StackedLayoutStatus>}
      </StackedLayoutRoot>
    </FocusablePartGroupingActivity>
  );
}

export default memo(PartGroupingActivity);
export { type PartGroupingActivityProps, partGroupingActivityPropsSchema };
