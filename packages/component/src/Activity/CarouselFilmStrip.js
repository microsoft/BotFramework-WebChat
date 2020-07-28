/* eslint complexity: ["error", 30] */

import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
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
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useUniqueId from '../hooks/internal/useUniqueId';

const ROOT_CSS = css({
  '&.webchat__carousel-layout': {
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

    '& .webchat__carousel-layout__alignment-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-layout__attachment': {
      flex: 1
    },

    '& .webchat__carousel-layout__attachments': {
      display: 'flex',
      listStyleType: 'none',
      margin: 0,
      padding: 0
    },

    '& .webchat__carousel-layout__avatar': {
      flexShrink: 0
    },

    '& .webchat__carousel-layout__avatar-gutter': {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },

    '& .webchat__carousel-layout__complimentary': {
      display: 'flex'
    },

    '& .webchat__carousel-layout__complimentary-content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-layout__content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-layout__filler': {
      flexGrow: 10000,
      flexShrink: 1
    },

    '& .webchat__carousel-layout__main': {
      display: 'flex'
    },

    '& .webchat__carousel-layout__message': {
      display: 'flex'
    },

    '& .webchat__carousel-layout__nub-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-layout__status': {
      display: 'flex'
    }
  }
});

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

const WebChatCarouselFilmStrip = ({
  activity,
  className,
  hideTimestamp,
  itemContainerRef,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  scrollableRef,
  showCallout
}) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ carouselFilmStrip: carouselFilmStripStyleSet }] = useStyleSet();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const ariaLabelId = useUniqueId('webchat__carousel-filmstrip__id');
  const localize = useLocalizer();
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

  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  return (
    <div
      aria-labelledby={ariaLabelId}
      className={classNames('webchat__carousel-layout', ROOT_CSS + '', carouselFilmStripStyleSet + '', className + '', {
        'webchat__carousel-layout--extra-trailing': extraTrailing,
        'webchat__carousel-layout--hide-avatar': hasAvatar && !showAvatar,
        'webchat__carousel-layout--hide-nub': hasNub && !showNub,
        'webchat__carousel-layout--no-message': !activityDisplayText,
        'webchat__carousel-layout--rtl': direction === 'rtl',
        'webchat__carousel-layout--show-avatar': showAvatar,
        'webchat__carousel-layout--show-nub': showNub,
        'webchat__carousel-layout--top-callout': topAlignedCallout
      })}
      ref={scrollableRef}
      role="group"
    >
      <div className="webchat__carousel-layout__main">
        <div className="webchat__carousel-layout__avatar-gutter">{showAvatar && renderAvatar({ activity })}</div>
        <div className="webchat__carousel-layout__content">
          {!!activityDisplayText && (
            // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
            /* eslint-disable-next-line react/forbid-dom-props */
            <div aria-roledescription="message" className="webchat__carousel-layout__message" id={ariaLabelId}>
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__carousel-layout__bubble"
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
              <div className="webchat__carousel-layout__filler" />
            </div>
          )}
          <div className="webchat__carousel-layout__complimentary">
            <div className="webchat__carousel-layout__nub-pad" />
            <div className="webchat__carousel-layout__complimentary-content">
              <ul className="webchat__carousel-layout__attachments" ref={itemContainerRef}>
                {/* attachments do not have an ID, it is always indexed by number */}
                {attachments.map((attachment, index) => (
                  /* eslint-disable-next-line react/no-array-index-key */
                  <li aria-roledescription="attachment" className="webchat__carousel-layout__attachment" key={index}>
                    <ScreenReaderText text={attachedAlt} />
                    {/* eslint-disable-next-line react/no-array-index-key */}
                    <Bubble fromUser={fromUser} key={index} nub={false}>
                      {renderAttachment({ activity, attachment })}
                    </Bubble>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="webchat__carousel-layout__alignment-pad" />
      </div>
      {showActivityStatus && (
        <div className="webchat__carousel-layout__status">
          <div className="webchat__carousel-layout__avatar-gutter" />
          <div className="webchat__carousel-layout__nub-pad" />
          {renderActivityStatus({ hideTimestamp })}
        </div>
      )}
    </div>
  );
};

WebChatCarouselFilmStrip.defaultProps = {
  className: '',
  hideTimestamp: false,
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: false
};

WebChatCarouselFilmStrip.propTypes = {
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
  itemContainerRef: PropTypes.any.isRequired,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  scrollableRef: PropTypes.any.isRequired,
  showCallout: PropTypes.bool
};

const CarouselFilmStrip = props => (
  <FilmContext.Consumer>
    {({ itemContainerRef, scrollableRef }) => (
      <WebChatCarouselFilmStrip itemContainerRef={itemContainerRef} scrollableRef={scrollableRef} {...props} />
    )}
  </FilmContext.Consumer>
);

export default CarouselFilmStrip;

export { connectCarouselFilmStrip };
