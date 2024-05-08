/* eslint complexity: ["error", 50] */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

import Bubble from './Bubble';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useUniqueId from '../hooks/internal/useUniqueId';

import type { FC, ReactNode } from 'react';
import type { RenderAttachment } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';

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

type StackedLayoutProps = {
  activity: WebChatActivity;
  hideTimestamp?: boolean;
  renderActivityStatus?: (options: { hideTimestamp: boolean }) => ReactNode;
  renderAttachment?: RenderAttachment;
  renderAvatar?: false | (() => Exclude<ReactNode, boolean | null | undefined>);
  showCallout?: boolean;
};

const StackedLayout: FC<StackedLayoutProps> = ({
  activity,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}) => {
  const [styleOptions] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__stacked-layout__id');
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const { bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize } = styleOptions;

  const isMessage = activity.type === 'message';

  const attachments = (isMessage && activity.attachments) || [];
  const fromUser = activity.from.role === 'user';
  const messageBackDisplayText: string = (isMessage && activity.channelData?.messageBack?.displayText) || '';

  const activityDisplayText = isMessage ? messageBackDisplayText || activity.text : '';
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
                {renderAttachment({
                  activity,
                  attachment: isMessage
                    ? {
                        content: activityDisplayText,
                        contentType: textFormatToContentType(activity.textFormat)
                      }
                    : undefined
                })}
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

StackedLayout.defaultProps = {
  hideTimestamp: false,
  renderActivityStatus: () => false,
  renderAvatar: undefined,
  showCallout: true
};

StackedLayout.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      })
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.oneOf(['markdown', 'plain', 'xml']),
    timestamp: PropTypes.string,
    type: PropTypes.string.isRequired
  }).isRequired,
  hideTimestamp: PropTypes.bool,

  // PropTypes cannot validate precisely with its TypeScript counterpart.
  // @ts-ignore
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,

  // PropTypes cannot validate precisely with its TypeScript counterpart.
  // @ts-ignore
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default memo(StackedLayout);
