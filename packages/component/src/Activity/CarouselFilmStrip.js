/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import { useLocalize } from '../Localization/Localize';
import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

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

const connectCarouselFilmStrip = (...selectors) => {
  console.warn(
    'Web Chat: connectCarouselFilmStrip() will be removed on or after 2021-09-27, please use useCarouselFilmStrip() instead.'
  );

  return connectToWebChat(
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
};

const useCarouselFilmStrip = ({ activity }) => {
  const { from: { role } = {} } = activity || {};
  const { botAvatarInitials, userAvatarInitials } = useStyleOptions();

  return {
    avatarInitials: role === 'user' ? userAvatarInitials : botAvatarInitials
  };
};

const WebChatCarouselFilmStrip = ({
  activity,
  children,
  className,
  itemContainerRef,
  scrollableRef,
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

  const { avatarInitials } = useCarouselFilmStrip({ activity });
  const styleOptions = useStyleOptions();
  const styleSet = useStyleSet();
  const roleLabel = useLocalize(fromUser ? 'UserSent' : 'BotSent');

  const activityDisplayText = messageBackDisplayText || text;
  const indented = fromUser ? styleOptions.bubbleFromUserNubSize : styleOptions.bubbleNubSize;

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
            <ScreenReaderText text={roleLabel} />
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
              <ScreenReaderText text={roleLabel} />
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
  children: PropTypes.any,
  className: PropTypes.string,
  itemContainerRef: PropTypes.any.isRequired,
  scrollableRef: PropTypes.any.isRequired,
  timestampClassName: PropTypes.string
};

const ConnectedCarouselFilmStrip = WebChatCarouselFilmStrip;

const CarouselFilmStrip = props => (
  <FilmContext.Consumer>
    {({ itemContainerRef, scrollableRef }) => (
      <ConnectedCarouselFilmStrip itemContainerRef={itemContainerRef} scrollableRef={scrollableRef} {...props} />
    )}
  </FilmContext.Consumer>
);

export default CarouselFilmStrip;

export { connectCarouselFilmStrip, useCarouselFilmStrip };
