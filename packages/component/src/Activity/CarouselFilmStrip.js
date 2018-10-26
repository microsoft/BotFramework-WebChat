import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import Avatar from './Avatar';
import Bubble from './Bubble';
import SendStatus from './SendStatus';
import Timestamp from './Timestamp';

import connectToWebChat from '../connectToWebChat';
import textFormatToContentType from '../Utils/textFormatToContentType';

const { ActivityClientState: { SENDING, SEND_FAILED } } = Constants;

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

const connectCarouselFilmStrip = (...selectors) => connectToWebChat(
  ({
    botAvatarInitials,
    language,
    userAvatarInitials
  }) => ({
    botAvatarInitials,
    language,
    userAvatarInitials
  }),
  ...selectors
)

const ConnectedCarouselFilmStrip = connectCarouselFilmStrip(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity,
    botAvatarInitials,
    children,
    className,
    filmContext,
    showTimestamp,
    styleSet,
    userAvatarInitials
  }) => {
    const fromUser = activity.from.role === 'user';
    const initials = fromUser ? userAvatarInitials : botAvatarInitials;

    return (
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.carouselFilmStrip + '',
          (className || '') + ''
        ) }
        ref={ filmContext._setFilmStripRef }
      >
        { !!initials &&
          <Avatar className="avatar" fromUser={ fromUser }>{ initials }</Avatar>
        }
        <div className="content">
          {
            !!activity.text &&
              <div className="message">
                <Bubble
                  className="bubble"
                  fromUser={ activity.from.role === 'user' }
                >
                  { children({
                    activity,
                    attachment: {
                      contentType: textFormatToContentType(activity.textFormat),
                      content: activity.text
                    }
                  }) }
                </Bubble>
                <div className="filler" />
              </div>
          }
          <ul>
            {
              activity.attachments.map((attachment, index) =>
                <li key={ index }>
                  <Bubble
                    fromUser={ activity.from.role === 'user' }
                    key={ index }
                  >
                    { children({ attachment }) }
                  </Bubble>
                </li>
              )
            }
          </ul>
          {
            (
              activity.channelData
              && (
                activity.channelData.state === SENDING
                || activity.channelData.state === SEND_FAILED
              )
            ) ?
              <SendStatus activity={ activity } />
            : showTimestamp &&
              <Timestamp activity={ activity } />
          }
        </div>
      </div>
    );
  }
)

export default props =>
  <FilmContext.Consumer>
    { filmContext =>
      <ConnectedCarouselFilmStrip
        filmContext={ filmContext }
        { ...props }
      />
    }
  </FilmContext.Consumer>

export { connectCarouselFilmStrip }
