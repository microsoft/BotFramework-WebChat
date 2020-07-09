/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
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
  display: 'flex',
  MsOverflowStyle: 'none',
  overflowX: 'scroll',
  overflowY: 'hidden',
  position: 'relative', // This is to keep screen reader text in the destinated area.
  touchAction: 'manipulation',
  WebkitOverflowScrolling: 'touch',

  '&::-webkit-scrollbar': {
    display: 'none'
  },

  '& > .webchat__carouselFilmStrip__avatar': {
    flexShrink: 0
  },

  '& > .content': {
    flex: 1,

    '& > .message': {
      display: 'flex',

      '& > .bubble': {
        flexGrow: 1,
        overflow: 'hidden'
      },

      '& > .filler': {
        flexGrow: 10000,
        flexShrink: 1
      }
    },

    '& > ul': {
      display: 'flex',
      listStyleType: 'none',
      margin: 0,
      padding: 0,

      '& > li': {
        flex: 1
      }
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
  itemContainerRef,
  renderActivityStatus,
  renderAvatar,
  scrollableRef
}) => {
  const [{ bubbleNubSize, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ carouselFilmStrip: carouselFilmStripStyleSet }] = useStyleSet();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const contentARIALabelId = useUniqueId('webchat__carousel-filmstrip__content');
  const localize = useLocalizer();
  const renderAttachment = useRenderAttachment();

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
    : localize('ACTIVITY_BOT_SAID_ALT', botInitials)
  ).replace(/\s{2,}/gu, ' ');
  const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;
  const nubType = !!nubSize && (typeof renderAvatar === 'function' ? true : 'indent');
  const indent = renderAvatar && nubType !== true;

  return (
    <div
      aria-labelledby={contentARIALabelId}
      className={classNames(
        ROOT_CSS + '',
        carouselFilmStripStyleSet + '',
        className + '',
        {
          webchat__carousel_indented_content: indent,
          webchat__carousel_extra_right_indent: !userInitials && bubbleFromUserNubSize
        },
        direction === 'rtl' ? 'webchat__carousel--rtl' : ''
      )}
      ref={scrollableRef}
      role="group"
    >
      {renderAvatar && (
        <div className="webchat__carouselFilmStrip__avatar">
          {typeof renderAvatar === 'function' && renderAvatar({ activity })}
        </div>
      )}
      <div className="content">
        {!!activityDisplayText && (
          // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
          /* eslint-disable-next-line react/forbid-dom-props */
          <div aria-roledescription="message" className="message" id={contentARIALabelId}>
            <ScreenReaderText text={greetingAlt} />
            <Bubble className="bubble" fromUser={fromUser} nub={nubType === true}>
              {renderAttachment({
                activity,
                attachment: {
                  content: activityDisplayText,
                  contentType: textFormatToContentType(textFormat)
                }
              })}
            </Bubble>
            <div aria-hidden={true} className="filler" />
          </div>
        )}
        <ul className={classNames({ webchat__carousel__item_indented: nubType === true })} ref={itemContainerRef}>
          {attachments.map((attachment, index) => (
            <li aria-roledescription="attachment" key={index}>
              <ScreenReaderText text={attachedAlt} />
              <Bubble fromUser={fromUser} key={index} nub={false}>
                {renderAttachment({ attachment })}
              </Bubble>
            </li>
          ))}
        </ul>
        {renderActivityStatus && (
          <div className={classNames({ webchat__carousel__item_indented: nubType === true })}>
            {typeof renderActivityStatus === 'function' && renderActivityStatus({ activity })}
          </div>
        )}
      </div>
    </div>
  );
};

WebChatCarouselFilmStrip.defaultProps = {
  className: '',
  renderActivityStatus: false,
  renderAvatar: false
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
  itemContainerRef: PropTypes.any.isRequired,
  scrollableRef: PropTypes.any.isRequired,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func]),
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func])
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
