/* eslint complexity: ["error", 30] */
/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useLocalizer from '../hooks/useLocalizer';
import useRenderAttachment from '../hooks/useRenderAttachment';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useUniqueId from '../hooks/internal/useUniqueId';

const ROOT_CSS = css({
  '&.webchat__stacked-layout': {
    position: 'relative', // This is to keep screen reader text in the destinated area.

    '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status': {
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
      '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__content, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status': {
        flexDirection: 'row-reverse'
      }
    },

    '& .webchat__stacked-layout__content': {
      flex: 1,
      overflow: 'hidden'
    },

    '& .webchat__stacked-layout__nub-pad': {
      flexShrink: 0
    }
  }
});

const connectStackedLayout = (...selectors) =>
  connectToWebChat(
    (
      {
        language,
        styleSet: {
          options: { botAvatarInitials, userAvatarInitials }
        }
      },
      { activity: { from: { role } = {} } = {} }
    ) => ({
      avatarInitials: role === 'user' ? userAvatarInitials : botAvatarInitials,
      language,

      // TODO: [P4] We want to deprecate botAvatarInitials/userAvatarInitials because they are not as helpful as avatarInitials
      botAvatarInitials,
      userAvatarInitials
    }),
    ...selectors
  );

const StackedLayout = ({ activity, renderActivityStatus, renderAvatar, showCallout }) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  const contentARIALabelId = useUniqueId('webchat__stacked-layout__id');
  const localize = useLocalizer();
  const renderAttachment = useRenderAttachment();
  const showActivityStatus = typeof renderActivityStatus === 'function';

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';

  const attachedAlt = localize(fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT');
  const greetingAlt = (fromUser
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
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
  // const showCallout = !!renderAvatar || (!hasAvatar && hasNub);

  const showAvatar = showCallout && hasAvatar;
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  return (
    <div
      aria-labelledby={contentARIALabelId}
      aria-roledescription="activity"
      className={classNames('webchat__stacked-layout', ROOT_CSS + '', stackedLayoutStyleSet + '', {
        'webchat__stacked-layout--extra-trailing': extraTrailing,
        'webchat__stacked-layout--from-user': fromUser,
        'webchat__stacked-layout--hide-avatar': hasAvatar && !showAvatar,
        'webchat__stacked-layout--hide-nub': hasNub && !showNub,
        'webchat__stacked-layout--show-avatar': showAvatar,
        'webchat__stacked-layout--show-nub': showNub,
        'webchat__stacked-layout--top-callout': topAlignedCallout
      })}
      role="group"
    >
      <div className="webchat__stacked-layout__main">
        <div className="webchat__stacked-layout__avatar-gutter">{showAvatar && renderAvatar({ activity })}</div>
        <div className="webchat__stacked-layout__content">
          {!!activityDisplayText && (
            <div
              aria-roledescription="message"
              className="webchat__stacked-layout__message-row"
              // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
              /* eslint-disable-next-line react/forbid-dom-props */
              id={contentARIALabelId}
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__stacked-layout__message"
                fromUser={fromUser}
                nub={showNub || ((hasAvatar || hasNub) && 'hidden')}
              >
                {renderAttachment({
                  activity,
                  attachment: {
                    content: activityDisplayText,
                    contentType: textFormatToContentType(textFormat)
                  }
                })}
              </Bubble>
            </div>
          )}
          {attachments.map((attachment, index) => (
            <div aria-roledescription="attachment" className="webchat__stacked-layout__attachment-row" key={index}>
              <ScreenReaderText text={attachedAlt} />
              <Bubble
                className="webchat__stacked-layout__attachment"
                fromUser={fromUser}
                key={index}
                nub={(hasAvatar || hasNub) && 'hidden'}
              >
                {renderAttachment({ attachment })}
              </Bubble>
            </div>
          ))}
        </div>
        <div className="webchat__stacked-layout__alignment-pad" />
      </div>
      {showActivityStatus && (
        <div className="webchat__stacked-layout__status">
          <div className="webchat__stacked-layout__avatar-gutter" />
          <div className="webchat__stacked-layout__nub-pad" />
          {renderActivityStatus({ activity })}
          <div className="webchat__stacked-layout__alignment-pad" />
        </div>
      )}
    </div>
  );
};

StackedLayout.defaultProps = {
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: true
};

StackedLayout.propTypes = {
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
    textFormat: PropTypes.string,
    timestamp: PropTypes.string,
    type: PropTypes.string.isRequired
  }).isRequired,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func]),
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default StackedLayout;

export { connectStackedLayout };
