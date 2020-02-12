/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import remarkStripMarkdown from '../Utils/remarkStripMarkdown';

import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useRenderActivityStatus from '../hooks/useRenderActivityStatus';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',
  MsOverflowStyle: 'none',
  overflowX: 'scroll',
  overflowY: 'hidden',
  touchAction: 'manipulation',
  WebkitOverflowScrolling: 'touch',

  '&::-webkit-scrollbar': {
    display: 'none'
  },

  '& > .avatar': {
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
  children,
  className,
  itemContainerRef,
  nextVisibleActivity,
  scrollableRef
}) => {
  const [{ bubbleNubSize, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ carouselFilmStrip: carouselFilmStripStyleSet }] = useStyleSet();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const renderActivityStatus = useRenderActivityStatus({ activity, nextVisibleActivity });

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const fromUser = role === 'user';
  const activityDisplayText = messageBackDisplayText || text;
  const strippedActivityDisplayText = remarkStripMarkdown(activityDisplayText);
  const indented = fromUser ? bubbleFromUserNubSize : bubbleNubSize;
  const initials = fromUser ? userInitials : botInitials;
  const roleLabel = localize(fromUser ? 'CAROUSEL_ATTACHMENTS_USER_ALT' : 'CAROUSEL_ATTACHMENTS_BOT_ALT');

  return (
    <div
      className={classNames(
        ROOT_CSS + '',
        carouselFilmStripStyleSet + '',
        className + '',
        {
          webchat__carousel_indented_content: initials && !indented,
          webchat__carousel_extra_right_indent: !userInitials && bubbleFromUserNubSize
        },
        direction === 'rtl' ? 'webchat__carousel--rtl' : ''
      )}
      ref={scrollableRef}
    >
      <Avatar aria-hidden={true} className="avatar" fromUser={fromUser} />
      <div className="content">
        {!!activityDisplayText && (
          <div className="message">
            <ScreenReaderText text={roleLabel + ' ' + strippedActivityDisplayText} />
            <Bubble aria-hidden={true} className="bubble" fromUser={fromUser} nub={true}>
              {children({
                activity,
                attachment: {
                  content: activityDisplayText,
                  contentType: textFormatToContentType(textFormat)
                }
              })}
            </Bubble>
            <div className="filler" />
          </div>
        )}
        <ul className={classNames({ webchat__carousel__item_indented: indented })} ref={itemContainerRef}>
          {attachments.map((attachment, index) => (
            // Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75 and Edge 44
            <li aria-label=" " key={index}>
              <ScreenReaderText text={roleLabel} />
              <Bubble fromUser={fromUser} key={index} nub={false}>
                {children({ attachment })}
              </Bubble>
            </li>
          ))}
        </ul>
        <div className={classNames({ webchat__carousel__item_indented: indented })}>{renderActivityStatus()}</div>
      </div>
    </div>
  );
};

WebChatCarouselFilmStrip.defaultProps = {
  children: undefined,
  className: '',
  nextVisibleActivity: undefined
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
  children: PropTypes.any,
  className: PropTypes.string,
  itemContainerRef: PropTypes.any.isRequired,
  nextVisibleActivity: PropTypes.shape({
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    timestamp: PropTypes.string
  }),
  scrollableRef: PropTypes.any.isRequired
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
