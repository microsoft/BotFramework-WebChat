/* eslint complexity: ["error", 50] */

import { hooks } from 'botframework-webchat-api';
import type { RenderAttachment } from 'botframework-webchat-api';
import { ActivityBorderDecorator } from 'botframework-webchat-api/decorator';
import { getActivityLivestreamingMetadata, getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';

import isBasedOnSoftwareSourceCode from '../Attachment/Text/private/isBasedOnSoftwareSourceCode';
import ScreenReaderText from '../ScreenReaderText';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useUniqueId from '../hooks/internal/useUniqueId';
import { ComponentIcon } from '../Icon';
import AttachmentRow from './AttachmentRow';
import Bubble from './Bubble';
import CodeBlockContent from './CodeBlockContent';
import CollapsibleContent from './CollapsibleContent';
import StackedLayoutMain from './StackedLayoutMain';
import StackedLayoutRoot from './StackedLayoutRoot';
import StackedLayoutStatus from './StackedLayoutStatus';
import MessageStatusLoader from './private/MessageStatusLoader';
import { useGetLogicalGroupKey } from '../providers/ActivityLogicalGrouping';

import styles from './StackedLayout.module.css';

const { useAvatarForBot, useAvatarForUser, useLocalizer, useGetKeyByActivity, useStyleOptions } = hooks;

type StackedLayoutInnerProps = Readonly<{
  activity: WebChatActivity;
  children?: ReactNode | undefined;
  fromUser: boolean;
  hasDisplayText: boolean;
  id: string;
  renderAvatar?: false | (() => Exclude<ReactNode, boolean | null | undefined>) | undefined;
  renderBubbleContent: (title?: string | undefined, showStatus?: boolean) => ReactNode;
  showAvatar?: boolean | undefined;
  showNub?: boolean | undefined;
}>;

const StackedLayoutInner = memo(
  ({
    activity,
    children,
    fromUser,
    hasDisplayText,
    id,
    renderAvatar,
    renderBubbleContent,
    showAvatar,
    showNub
  }: StackedLayoutInnerProps) => {
    const [styleOptions] = useStyleOptions();
    const [{ initials: botInitials }] = useAvatarForBot();
    const [{ initials: userInitials }] = useAvatarForUser();
    const localize = useLocalizer();
    const classNames = useStyles(styles);

    const messageThing = useMemo(() => getOrgSchemaMessage(activity.entities), [activity]);
    const { bubbleNubSize, bubbleFromUserNubSize } = styleOptions;
    const greetingAlt = (
      fromUser ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
    ).replace(/\s{2,}/gu, ' ');

    const initials = fromUser ? userInitials : botInitials;
    const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;

    const hasAvatar = initials || typeof initials === 'string';
    const hasNub = typeof nubSize === 'number';

    return (
      <StackedLayoutMain avatar={showAvatar && renderAvatar && renderAvatar()}>
        {!!(hasDisplayText || messageThing?.abstract) && (
          <div
            aria-roledescription="message"
            className={cx(classNames['stacked-layout__message-row'])}
            // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
            /* eslint-disable-next-line react/forbid-dom-props */
            id={id}
            role="group"
          >
            <ScreenReaderText text={greetingAlt} />
            <Bubble
              className={classNames['stacked-layout__message']}
              fromUser={fromUser}
              nub={showNub || (hasAvatar || hasNub ? 'hidden' : false)}
            >
              <ActivityBorderDecorator activity={activity}>
                {renderBubbleContent(messageThing?.abstract)}
              </ActivityBorderDecorator>
            </Bubble>
          </div>
        )}
        <div className={classNames['stacked-layout__attachment-list']}>{children}</div>
      </StackedLayoutMain>
    );
  }
);

StackedLayoutInner.displayName = 'StackedLayoutInner';

type StackedLayoutProps = Readonly<{
  activity: WebChatActivity;
  hideTimestamp?: boolean | undefined;
  renderActivityStatus?: ((options: { hideTimestamp: boolean }) => ReactNode) | undefined;
  renderAttachment?: RenderAttachment | undefined;
  renderAvatar?: false | (() => Exclude<ReactNode, boolean | null | undefined>) | undefined;
  showCallout?: boolean | undefined;
}>;

const StackedLayout = ({
  activity,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}: StackedLayoutProps) => {
  const [styleOptions] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const ariaLabelId = useUniqueId('webchat__stacked-layout__id');
  const localize = useLocalizer();
  const classNames = useStyles(styles);

  const { bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize } = styleOptions;

  const isMessageOrTyping = activity.type === 'message' || activity.type === 'typing';

  const attachments = useMemo(() => (isMessageOrTyping && activity.attachments) || [], [activity, isMessageOrTyping]);
  const fromUser = activity.from.role === 'user';
  const messageBackDisplayText: string = (isMessageOrTyping && activity.channelData?.messageBack?.displayText) || '';
  const messageThing = useMemo(() => getOrgSchemaMessage(activity.entities), [activity]);
  const isCollapsible = useMemo(() => messageThing?.keywords?.includes('Collapsible'), [messageThing]);

  const isLivestreaming = !!getActivityLivestreamingMetadata(activity);
  const activityDisplayText = isMessageOrTyping
    ? messageBackDisplayText || activity.text
    : isLivestreaming && 'text' in activity
      ? (activity.text as string)
      : '';

  const initials = fromUser ? userInitials : botInitials;
  const nubOffset = fromUser ? bubbleFromUserNubOffset : bubbleNubOffset;
  const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;
  const otherInitials = fromUser ? botInitials : userInitials;
  const otherNubSize = fromUser ? bubbleNubSize : bubbleFromUserNubSize;

  const hasAvatar = initials || typeof initials === 'string';
  const hasOtherAvatar = otherInitials || typeof otherInitials === 'string';
  const hasNub = typeof nubSize === 'number';
  const hasOtherNub = typeof otherNubSize === 'number';
  const topAlignedCallout = isZeroOrPositive(nubOffset);
  const activityKey = useGetKeyByActivity()(activity);
  const isInGroup = !!useGetLogicalGroupKey()(activityKey);

  const extraTrailing = !hasOtherAvatar && hasOtherNub; // This is for bot message with user nub and no user avatar. And vice versa.

  const showAvatar = !isInGroup && showCallout && hasAvatar && !!renderAvatar;
  const showNub = !isInGroup && showCallout && hasNub && (topAlignedCallout || !attachments?.length);

  const showStatus = !!messageThing?.creativeWorkStatus || isInGroup;

  const messageStatus = useMemo(
    () =>
      showStatus && (
        <div
          className={cx(classNames['stacked-layout__message-status'], {
            [classNames['stacked-layout__message-status--unset']]: !messageThing?.creativeWorkStatus,
            [classNames['stacked-layout__message-status--final']]: messageThing?.creativeWorkStatus === 'published',
            [classNames['stacked-layout__message-status--incomplete']]:
              messageThing?.creativeWorkStatus === 'incomplete'
          })}
        >
          <ComponentIcon
            appearance="text"
            className={classNames['stacked-layout__message-status-unset-icon']}
            icon="unchecked-circle"
          />
          <ComponentIcon
            appearance="text"
            className={classNames['stacked-layout__message-status-complete-icon']}
            icon="checkmark-circle"
          />
          <MessageStatusLoader className={classNames['stacked-layout__message-status-loader']} />
        </div>
      ),
    [classNames, messageThing?.creativeWorkStatus, showStatus]
  );

  const renderMainBubbleContent = useCallback(
    (title = '', withStatus = true) => (
      <div className={classNames['stacked-layout__bubble']}>
        {withStatus && messageStatus}
        {title && <div className={classNames['stacked-layout__title']}>{title}</div>}
        {activityDisplayText &&
          renderAttachment({
            activity,
            attachment: {
              content: activityDisplayText,
              contentType: textFormatToContentType('textFormat' in activity ? activity.textFormat : undefined)
            }
          })}
      </div>
    ),
    [activity, activityDisplayText, classNames, messageStatus, renderAttachment]
  );

  const attachmentChildren = useMemo(() => {
    const syntheticAttachments = [];

    const attachmentAlt = localize(
      fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT',
      otherInitials || ''
    );

    if (isCollapsible && 'text' in activity && activity.text) {
      syntheticAttachments.push(
        <AttachmentRow
          attachedAlt={attachmentAlt}
          fromUser={fromUser}
          hasAvatar={!!hasAvatar}
          hasNub={!!hasNub}
          key={syntheticAttachments.length}
          showBubble={false}
        >
          {renderMainBubbleContent('', false)}
        </AttachmentRow>
      );
    }

    if (isCollapsible && isBasedOnSoftwareSourceCode(messageThing)) {
      syntheticAttachments.push(
        <AttachmentRow
          attachedAlt={attachmentAlt}
          fromUser={fromUser}
          hasAvatar={!!hasAvatar}
          hasNub={!!hasNub}
          key={syntheticAttachments.length}
          showBubble={false}
        >
          <CodeBlockContent
            code={messageThing.isBasedOn.text}
            key={syntheticAttachments.length}
            language={messageThing.isBasedOn.programmingLanguage}
            title={messageThing.isBasedOn.programmingLanguage}
          />
        </AttachmentRow>
      );
    }

    return syntheticAttachments.concat(
      attachments.map((attachment, index) => (
        <AttachmentRow
          attachedAlt={attachmentAlt}
          fromUser={fromUser}
          hasAvatar={!!hasAvatar}
          hasNub={!!hasNub}
          /* eslint-disable-next-line react/no-array-index-key */
          key={index + syntheticAttachments.length}
          showBubble={isCollapsible ? false : true}
        >
          {renderAttachment({ activity, attachment })}
        </AttachmentRow>
      ))
    );
  }, [
    activity,
    attachments,
    fromUser,
    hasAvatar,
    hasNub,
    isCollapsible,
    localize,
    messageThing,
    otherInitials,
    renderAttachment,
    renderMainBubbleContent
  ]);

  const renderCollapsibleBubbleContent = useCallback(
    (title = '') => (
      <div className={classNames['stacked-layout__bubble']}>
        {messageStatus}
        <CollapsibleContent
          summary={title}
          summaryClassName={cx(classNames['stacked-layout__title'], classNames['stacked-layout__title--collapsible'])}
        >
          <div className={classNames['stacked-layout__attachment-list']}>{attachmentChildren}</div>
        </CollapsibleContent>
      </div>
    ),
    [attachmentChildren, classNames, messageStatus]
  );

  const renderBubbleContent = isCollapsible ? renderCollapsibleBubbleContent : renderMainBubbleContent;

  return (
    <StackedLayoutRoot
      ariaLabelId={activityDisplayText ? ariaLabelId : undefined}
      extraTrailing={extraTrailing}
      fromUser={fromUser}
      hideAvatar={hasAvatar && !showAvatar}
      hideNub={hasNub && !showNub}
      noMessage={!activityDisplayText && !isCollapsible}
      showAvatar={showAvatar}
      showNub={showNub}
      topCallout={topAlignedCallout}
    >
      <StackedLayoutInner
        activity={activity}
        fromUser={fromUser}
        hasDisplayText={!!activityDisplayText?.length || isCollapsible}
        id={ariaLabelId}
        renderAvatar={renderAvatar}
        renderBubbleContent={renderBubbleContent}
        showAvatar={showAvatar}
        showNub={showNub}
      >
        {!isCollapsible && attachmentChildren.length > 0 && attachmentChildren}
      </StackedLayoutInner>
      {renderActivityStatus && !isInGroup && (
        <StackedLayoutStatus>{renderActivityStatus({ hideTimestamp })}</StackedLayoutStatus>
      )}
    </StackedLayoutRoot>
  );
};

StackedLayout.displayName = 'StackedLayout';

export default memo(StackedLayout);
