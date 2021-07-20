/* eslint complexity: ["error", 30] */

import { hooks } from 'botframework-webchat-api';
import { useItemContainerCallbackRef, useScrollableCallbackRef } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Bubble from './Bubble';
import CarouselFilmStripAttachment from './CarouselFilmStripAttachment';
import connectToWebChat from '../connectToWebChat';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useAvatarForBot, useAvatarForUser, useDirection, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__carousel-filmstrip': {
    display: 'flex',
    flexDirection: 'column',
    MsOverflowStyle: 'none',
    overflowX: 'scroll',
    overflowY: 'hidden',
    position: 'relative', // This is to keep screen reader text in the destinated area.
    touchAction: 'manipulation',
    WebkitOverflowScrolling: 'touch',

    '&::-webkit-scrollbar': {
      display: 'none'
    },

    '& .webchat__carousel-filmstrip__alignment-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip-attachment': {
      flex: 1
    },

    '& .webchat__carousel-filmstrip__attachments': {
      display: 'flex',
      listStyleType: 'none',
      margin: 0,
      padding: 0
    },

    '& .webchat__carousel-filmstrip__avatar': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__avatar-gutter': {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__complimentary': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__complimentary-content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-filmstrip__content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-filmstrip__filler': {
      flexGrow: 10000,
      flexShrink: 1
    },

    '& .webchat__carousel-filmstrip__main': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__message': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__nub-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__status': {
      display: 'flex'
    }
  }
};

const connectCarouselFilmStrip = (...selectors) =>
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
      language
    }),
    ...selectors
  );

const CarouselFilmStrip = ({
  activity,
  className,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ carouselFilmStrip: carouselFilmStripStyleSet }] = useStyleSet();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const showActivityStatus = typeof renderActivityStatus === 'function';

  const itemContainerCallbackRef = useItemContainerCallbackRef();
  const scrollableCallbackRef = useScrollableCallbackRef();

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';

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
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  const hideNub = hasNub && !showNub;

  return (
    <div
      className={classNames(
        'webchat__carousel-filmstrip',
        {
          'webchat__carousel-filmstrip--extra-trailing': extraTrailing,
          'webchat__carousel-filmstrip--hide-avatar': hasAvatar && !showAvatar,
          'webchat__carousel-filmstrip--hide-nub': hideNub,
          'webchat__carousel-filmstrip--no-message': !activityDisplayText,
          'webchat__carousel-filmstrip--rtl': direction === 'rtl',
          'webchat__carousel-filmstrip--show-avatar': showAvatar,
          'webchat__carousel-filmstrip--show-nub': showNub,
          'webchat__carousel-filmstrip--top-callout': topAlignedCallout
        },
        'react-film__filmstrip',
        rootClassName,
        carouselFilmStripStyleSet + '',
        (className || '') + ''
      )}
      ref={scrollableCallbackRef}
      role="group"
    >
      <div className="webchat__carousel-filmstrip__main">
        <div className="webchat__carousel-filmstrip__avatar-gutter">{showAvatar && renderAvatar({ activity })}</div>
        <div className="webchat__carousel-filmstrip__content">
          {!!activityDisplayText && (
            <div aria-roledescription="message" className="webchat__carousel-filmstrip__message" role="group">
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__carousel-filmstrip__bubble"
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
              <div className="webchat__carousel-filmstrip__filler" />
            </div>
          )}
          <div className="webchat__carousel-filmstrip__complimentary">
            <div className="webchat__carousel-filmstrip__nub-pad" />
            <div className="webchat__carousel-filmstrip__complimentary-content c">
              <ul
                className="webchat__carousel-filmstrip__attachments react-film__filmstrip__list"
                ref={itemContainerCallbackRef}
              >
                {attachments.map((attachment, index) => (
                  <CarouselFilmStripAttachment
                    activity={activity}
                    attachment={attachment}
                    fromUser={fromUser}
                    hasAvatar={hasAvatar}
                    hideNub={hideNub}
                    index={index}
                    /* Attachments do not have an ID; it is always indexed by number */
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    renderAttachment={renderAttachment}
                    showAvatar={showAvatar}
                    showNub={showNub}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="webchat__carousel-filmstrip__alignment-pad" />
      </div>
      {showActivityStatus && (
        <div className="webchat__carousel-filmstrip__status">
          <div className="webchat__carousel-filmstrip__avatar-gutter" />
          <div className="webchat__carousel-filmstrip__nub-pad" />
          {renderActivityStatus({ hideTimestamp })}
        </div>
      )}
    </div>
  );
};

CarouselFilmStrip.defaultProps = {
  className: '',
  hideTimestamp: false,
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: false
};

CarouselFilmStrip.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      }),
      state: PropTypes.string
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  hideTimestamp: PropTypes.bool,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default CarouselFilmStrip;

export { connectCarouselFilmStrip };
