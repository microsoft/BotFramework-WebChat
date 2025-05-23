/* eslint complexity: ["error", 50] */

import { hooks } from 'botframework-webchat-api';
import { ActivityBorderDecorator } from 'botframework-webchat-api/decorator';
import classNames from 'classnames';
import React, { memo } from 'react';

import ScreenReaderText from '../ScreenReaderText';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import textFormatToContentType from '../Utils/textFormatToContentType';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useUniqueId from '../hooks/internal/useUniqueId';
import useStyleSet from '../hooks/useStyleSet';
import Bubble from './Bubble';

import type { RenderAttachment } from 'botframework-webchat-api';
import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import type { ReactNode } from 'react';

const { useAvatarForBot, useAvatarForUser, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__stacked-layout': {
    position: 'relative', // This is to keep screen reader text in the destinated area.

    '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status':
      {
        display: 'flex'
      },

    '& .webchat__stacked-layout__alignment-pad': {
      flexShrink: 0
    },

    '& .webchat__stacked-layout__attachment': {
      width: '100%'
    },

    '& .webchat__stacked-layout__avatar-gutter': {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },

    '&.webchat__stacked-layout--from-user': {
      '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status':
        {
          flexDirection: 'row-reverse'
        }
    },

    '& .webchat__stacked-layout__content': {
      flex: 1,

      // This is for bottom aligning an avatar with a message bubble shorter than the avatar.
      // Related to the test at activityGrouping.avatarMiddleware.atBottom.js.
      display: 'flex',
      flexDirection: 'column',

      // This "overflow: hidden" is to make sure text overflow will get clipped correctly.
      // Related to the test at basic.js "long URLs with keep-all".
      overflow: 'hidden'
    },

    '& .webchat__stacked-layout__nub-pad': {
      flexShrink: 0
    }
  }
};

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
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__stacked-layout__id');
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const { bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize } = styleOptions;

  const isMessageOrTyping = activity.type === 'message' || activity.type === 'typing';

  const attachments = (isMessageOrTyping && activity.attachments) || [];
  const fromUser = activity.from.role === 'user';
  const messageBackDisplayText: string = (isMessageOrTyping && activity.channelData?.messageBack?.displayText) || '';

  const isLivestreaming = !!getActivityLivestreamingMetadata(activity);
  const activityDisplayText = isMessageOrTyping
    ? messageBackDisplayText || activity.text
    : isLivestreaming && 'text' in activity
      ? activity.text
      : '';
  const attachedAlt = localize(fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT');
  const greetingAlt = (
    fromUser ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');

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

  return (
    <div
      aria-labelledby={activityDisplayText ? ariaLabelId : undefined}
      className={classNames('webchat__stacked-layout', rootClassName, stackedLayoutStyleSet + '', {
        'webchat__stacked-layout--extra-trailing': extraTrailing,
        'webchat__stacked-layout--from-user': fromUser,
        'webchat__stacked-layout--hide-avatar': hasAvatar && !showAvatar,
        'webchat__stacked-layout--hide-nub': hasNub && !showNub,
        'webchat__stacked-layout--no-message': !activityDisplayText,
        'webchat__stacked-layout--show-avatar': showAvatar,
        'webchat__stacked-layout--show-nub': showNub,
        'webchat__stacked-layout--top-callout': topAlignedCallout
      })}
    >
      <div className="webchat__stacked-layout__main">
        <div className="webchat__stacked-layout__avatar-gutter">{showAvatar && renderAvatar()}</div>
        <div className="webchat__stacked-layout__content">
          {!!activityDisplayText && (
            <div
              aria-roledescription="message"
              className="webchat__stacked-layout__message-row"
              // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
              /* eslint-disable-next-line react/forbid-dom-props */
              id={ariaLabelId}
              role="group"
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__stacked-layout__message"
                fromUser={fromUser}
                nub={showNub || (hasAvatar || hasNub ? 'hidden' : false)}
              >
                <ActivityBorderDecorator activity={activity}>
                  {renderAttachment({
                    activity,
                    attachment: {
                      content: activityDisplayText,
                      contentType: textFormatToContentType('textFormat' in activity ? activity.textFormat : undefined)
                    }
                  })}
                </ActivityBorderDecorator>
              </Bubble>
            </div>
          )}
          {attachments.map((attachment, index) => (
            <div
              aria-roledescription="attachment"
              className={classNames('webchat__stacked-layout__attachment-row', {
                'webchat__stacked-layout__attachment-row--first': !index
              })}
              /* attachments do not have an ID, it is always indexed by number */
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              role="group"
            >
              <ScreenReaderText text={attachedAlt} />
              <Bubble
                className="webchat__stacked-layout__attachment"
                fromUser={fromUser}
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                nub={hasAvatar || hasNub ? 'hidden' : false}
              >
                {renderAttachment({ activity, attachment })}
              </Bubble>
            </div>
          ))}
        </div>
        <div className="webchat__stacked-layout__alignment-pad" />
      </div>
      {typeof renderActivityStatus === 'function' && (
        <div className="webchat__stacked-layout__status">
          <div className="webchat__stacked-layout__avatar-gutter" />
          <div className="webchat__stacked-layout__nub-pad" />
          {renderActivityStatus({ hideTimestamp })}
          <div className="webchat__stacked-layout__alignment-pad" />
        </div>
      )}
    </div>
  );
};

StackedLayout.displayName = 'StackedLayout';

export default memo(StackedLayout);
