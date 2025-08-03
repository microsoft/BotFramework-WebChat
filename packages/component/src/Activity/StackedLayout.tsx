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
import AttachmentRow from './AttachmentRow';
import Bubble from './Bubble';
import CodeBlockContent from './CodeBlockContent';
import CollapsibleContent from './CollapsibleContent';

import styles from './StackedLayout.module.css';

const { useAvatarForBot, useAvatarForUser, useLocalizer, useStyleOptions } = hooks;

type StackedLayoutInnerProps = Readonly<{
  activity: WebChatActivity;
  children?: ReactNode | undefined;
  fromUser: boolean;
  hasAttachments: boolean;
  hasDisplayText: boolean;
  id: string;
  renderAvatar?: false | (() => Exclude<ReactNode, boolean | null | undefined>) | undefined;
  renderBubbleContent: (title?: string | undefined) => ReactNode;
  showCallout?: boolean | undefined;
}>;

const StackedLayoutInner = memo(
  ({
    activity,
    children,
    fromUser,
    hasAttachments,
    hasDisplayText,
    id,
    renderAvatar,
    renderBubbleContent,
    showCallout
  }: StackedLayoutInnerProps) => {
    const [styleOptions] = useStyleOptions();
    const [{ initials: botInitials }] = useAvatarForBot();
    const [{ initials: userInitials }] = useAvatarForUser();
    const localize = useLocalizer();
    const classNames = useStyles(styles);

    const messageThing = useMemo(() => getOrgSchemaMessage(activity.entities), [activity]);
    const { bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize } = styleOptions;
    const greetingAlt = (
      fromUser ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
    ).replace(/\s{2,}/gu, ' ');

    const initials = fromUser ? userInitials : botInitials;
    const nubOffset = fromUser ? bubbleFromUserNubOffset : bubbleNubOffset;
    const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;

    const hasAvatar = initials || typeof initials === 'string';
    const hasNub = typeof nubSize === 'number';
    const topAlignedCallout = isZeroOrPositive(nubOffset);

    const showAvatar = showCallout && hasAvatar && !!renderAvatar;
    const showNub = showCallout && hasNub && (topAlignedCallout || !hasAttachments);

    return (
      <div className={classNames['stacked-layout__main']}>
        <div className={cx(classNames['stacked-layout__avatar-gutter'])}>
          {showAvatar && renderAvatar && renderAvatar()}
        </div>
        <div className={cx(classNames['stacked-layout__content'])}>
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
        </div>
        <div className={classNames['stacked-layout__alignment-pad']} />
      </div>
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

  const extraTrailing = !hasOtherAvatar && hasOtherNub; // This is for bot message with user nub and no user avatar. And vice versa.

  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments?.length);

  const renderMainBubbleContent = useCallback(
    (title = '') => (
      <div className={classNames['stacked-layout__bubble']}>
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
    [activity, activityDisplayText, classNames, renderAttachment]
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
          {renderMainBubbleContent()}
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
      <CollapsibleContent summary={title} summaryClassName={classNames['stacked-layout__title']}>
        <div className={classNames['stacked-layout__attachment-list']}>{attachmentChildren}</div>
      </CollapsibleContent>
    ),
    [attachmentChildren, classNames]
  );

  const renderBubbleContent = isCollapsible ? renderCollapsibleBubbleContent : renderMainBubbleContent;

  return (
    <div
      aria-labelledby={activityDisplayText ? ariaLabelId : undefined}
      className={cx('webchat__stacked-layout', classNames['stacked-layout'], {
        [classNames['stacked-layout--from-user']]: fromUser,
        [classNames['stacked-layout--extra-trailing']]: extraTrailing,
        [classNames['stacked-layout--hide-avatar']]: hasAvatar && !showAvatar,
        [classNames['stacked-layout--hide-nub']]: hasNub && !showNub,
        [classNames['stacked-layout--no-message']]: !activityDisplayText && !isCollapsible,
        [classNames['stacked-layout--show-avatar']]: showAvatar,
        [classNames['stacked-layout--show-nub']]: showNub,
        [classNames['stacked-layout--top-callout']]: topAlignedCallout
      })}
    >
      <StackedLayoutInner
        activity={activity}
        fromUser={fromUser}
        hasAttachments={attachmentChildren.length > 0}
        hasDisplayText={!!activityDisplayText?.length || isCollapsible}
        id={ariaLabelId}
        renderAvatar={renderAvatar}
        renderBubbleContent={renderBubbleContent}
        showCallout={showCallout}
      >
        {!isCollapsible && attachmentChildren.length > 0 && attachmentChildren}
      </StackedLayoutInner>
      {typeof renderActivityStatus === 'function' && (
        <div className={cx(classNames['stacked-layout__status'])}>
          <div className={cx(classNames['stacked-layout__avatar-gutter'])} />
          <div className={cx(classNames['stacked-layout__nub-pad'])} />
          {renderActivityStatus({ hideTimestamp })}
          <div className={cx(classNames['stacked-layout__alignment-pad'])} />
        </div>
      )}
    </div>
  );
};

StackedLayout.displayName = 'StackedLayout';

export default memo(StackedLayout);
