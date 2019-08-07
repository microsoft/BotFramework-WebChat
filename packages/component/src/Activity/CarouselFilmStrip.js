/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import { localize } from '../Localization/Localize';
import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';

const {
  ActivityClientState: { SENDING, SEND_FAILED }
} = Constants;

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
  avatarInitials,
  children,
  className,
  itemContainerRef,
  language,
  scrollableRef,
  styleSet,
  timestampClassName
}) => {
  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {}, state } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const fromUser = role === 'user';
  const activityDisplayText = messageBackDisplayText || text;
  const indented = fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize;

  return (
    <div
      className={classNames(ROOT_CSS + '', styleSet.carouselFilmStrip + '', className + '', {
        webchat__carousel_indented_content: avatarInitials && !indented
      })}
      ref={scrollableRef}
    >
      <Avatar aria-hidden={true} className="avatar" fromUser={fromUser} />
      <div className="content">
        {!!activityDisplayText && (
          <div className="message">
            <ScreenReaderText text={fromUser ? localize('UserSent', language) : localize('BotSent', language)} />
            <Bubble className="bubble" fromUser={fromUser} nub={true}>
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
            <li key={index}>
              <ScreenReaderText text={fromUser ? localize('UserSent', language) : localize('BotSent', language)} />
              <Bubble fromUser={fromUser} key={index} nub={false}>
                {children({ attachment })}
              </Bubble>
            </li>
          ))}
        </ul>
        <div className={classNames({ webchat__carousel__item_indented: indented })}>
          {state === SENDING || state === SEND_FAILED ? (
            <SendStatus activity={activity} />
          ) : (
            <Timestamp activity={activity} className={timestampClassName} />
          )}
        </div>
      </div>
    </div>
  );
};

WebChatCarouselFilmStrip.defaultProps = {
  avatarInitials: '',
  children: undefined,
  className: '',
  timestampClassName: ''
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
  avatarInitials: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  itemContainerRef: PropTypes.any.isRequired,
  language: PropTypes.string.isRequired,
  scrollableRef: PropTypes.any.isRequired,
  styleSet: PropTypes.shape({
    carouselFilmStrip: PropTypes.any.isRequired
  }).isRequired,
  timestampClassName: PropTypes.string
};

const ConnectedCarouselFilmStrip = connectCarouselFilmStrip(({ avatarInitials, language, styleSet }) => ({
  avatarInitials,
  language,
  styleSet
}))(WebChatCarouselFilmStrip);

const CarouselFilmStrip = props => (
  <FilmContext.Consumer>
    {({ itemContainerRef, scrollableRef }) => (
      <ConnectedCarouselFilmStrip itemContainerRef={itemContainerRef} scrollableRef={scrollableRef} {...props} />
    )}
  </FilmContext.Consumer>
);

export default CarouselFilmStrip;

export { connectCarouselFilmStrip };
