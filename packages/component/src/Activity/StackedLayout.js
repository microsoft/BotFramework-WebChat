/* eslint complexity: ["error", 30] */
/* eslint react/no-array-index-key: "off" */

import { css, first } from 'glamor';
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
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useRenderAttachment from '../hooks/useRenderAttachment';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useUniqueId from '../hooks/internal/useUniqueId';

const ROOT_CSS = css({
  '&.webchat__stacked-layout': {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // This is to keep screen reader text in the destinated area.

    '& .webchat__stacked-layout__main-row': {
      display: 'flex',
      flexDirection: 'row'
    },

    '& .webchat__stacked-layout__avatar-column': {
      display: 'flex',
      flexShrink: 0
    },

    '& .webchat__stacked-layout__content-column': {
      flexGrow: 1,
      overflow: 'hidden'
    },

    '& .webchat__stacked-layout__content-row': {
      display: 'flex'
    },

    '& .webchat__stacked-layout__status-row': {
      display: 'flex'
    },

    '& .webchat__stacked-layout__bubble': {
      flexGrow: 1,
      overflow: 'hidden'
    },

    '& .webchat__stacked-layout__attachment-bubble': {
      flexGrow: 1
    },

    '& .webchat__stacked-layout__filler': {
      flexGrow: 10000,
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

const StackedLayout = ({ activity, leading, renderActivityStatus, renderAvatar, trailing }) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const contentARIALabelId = useUniqueId('webchat__stacked-layout__content-column');
  const localize = useLocalizer();
  const renderAttachment = useRenderAttachment();
  const showActivityStatus = typeof renderActivityStatus === 'function';

  const attachedAlt = localize(fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT');
  const greetingAlt = (fromUser
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials)
  ).replace(/\s{2,}/gu, ' ');
  const rtl = direction === 'rtl';

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';

  const initials = fromUser ? userInitials : botInitials;
  const nubOffset = fromUser ? bubbleFromUserNubOffset : bubbleNubOffset;
  const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;
  const otherInitials = fromUser ? botInitials : userInitials;
  const otherNubSize = fromUser ? bubbleNubSize : bubbleFromUserNubSize;

  const hasAvatar = initials || typeof initials === 'string';
  const hasOtherAvatar = otherInitials || typeof otherInitials === 'string';
  const hasNub = typeof nubSize === 'number';
  const hasOtherNub = typeof otherNubSize === 'number';
  const rightSide = (!rtl && fromUser) || (rtl && !fromUser);
  const topAlignedCallout = isZeroOrPositive(nubOffset);

  const extraIndent = !hasOtherAvatar && hasOtherNub; // This is for bot message with user nub and no user avatar. And vice versa.
  const showCallout = (topAlignedCallout && leading) || (!topAlignedCallout && trailing);

  const showAvatar = hasAvatar && showCallout;
  const showNub = hasNub && showCallout && (topAlignedCallout || !attachments.length);

  return (
    <div
      aria-labelledby={contentARIALabelId}
      aria-roledescription="activity"
      className={classNames('webchat__stacked-layout', ROOT_CSS + '', stackedLayoutStyleSet + '', {
        'webchat__stacked-layout--from-user': fromUser,
        'webchat__stacked-layout--right-side': rightSide,
        'webchat__stacked-layout--extra-indent': extraIndent,
        'webchat__stacked-layout--extra-left-indent':
          (!rtl && fromUser && !renderAvatar && bubbleNubSize) ||
          (rtl && !fromUser && !renderAvatar && bubbleFromUserNubSize),
        'webchat__stacked-layout--extra-right-indent':
          (!rtl && !fromUser && !renderAvatar && bubbleFromUserNubSize) ||
          (rtl && fromUser && !renderAvatar && bubbleNubSize)
      })}
      role="group"
    >
      <div className="webchat__stacked-layout__main-row">
        {hasAvatar && (
          <div
            className={classNames('webchat__stacked-layout__avatar-column', {
              'webchat__stacked-layout__avatar-column--align-bottom': !topAlignedCallout
            })}
          >
            {showAvatar && renderAvatar({ activity })}
          </div>
        )}
        <div className="webchat__stacked-layout__content-column">
          {!!activityDisplayText && (
            // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
            /* eslint-disable-next-line react/forbid-dom-props */
            <div
              aria-roledescription="message"
              className={classNames('webchat__stacked-layout__content-row', {
                'webchat__stacked-layout__content-row--indented': (hasAvatar && !hasNub) || (hasNub && !showNub)
              })}
              id={contentARIALabelId}
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className={classNames('webchat__stacked-layout__message-bubble', {
                  'webchat__stacked-layout__messeage-bubble--show-nub': showNub
                })}
                fromUser={fromUser}
                nub={showNub}
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
            <div
              aria-roledescription="attachment"
              className={classNames('webchat__stacked-layout__content-row', {
                'webchat__stacked-layout__content-row--indented': hasAvatar || hasNub
              })}
              key={index}
            >
              <ScreenReaderText text={attachedAlt} />
              <Bubble
                className="webchat__stacked-layout__attachment-bubble"
                fromUser={fromUser}
                key={index}
                nub={false}
              >
                {renderAttachment({ attachment })}
              </Bubble>
            </div>
          ))}
        </div>
      </div>
      {showActivityStatus && trailing && (
        <div className="webchat__stacked-layout__status-row">
          <div
            className={classNames('webchat__stacked-layout__avatar-filler', {
              'webchat__stacked-layout__avatar-filler--for-avatar': hasAvatar,
              'webchat__stacked-layout__avatar-filler--for-nub': hasNub
            })}
          />
          {showActivityStatus && renderActivityStatus({ activity })}
        </div>
      )}
    </div>
  );
};

StackedLayout.defaultProps = {
  renderActivityStatus: false,
  renderAvatar: false
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
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func])
};

export default StackedLayout;

export { connectStackedLayout };
