import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import { localize } from '../Localization/Localize';
import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';

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
    language,
    styleSet: {
      options: {
        botAvatarInitials,
        userAvatarInitials
      }
    }
  }, { activity }) => ({
    avatarInitials: activity.from && activity.from.role === 'user' ? userAvatarInitials : botAvatarInitials,
    language
  }),
  ...selectors
)

const ConnectedCarouselFilmStrip = connectCarouselFilmStrip(
  ({
    avatarInitials,
    language,
    styleSet
  }) => ({
    avatarInitials,
    language,
    styleSet
  })
)(
  ({
    activity,
    avatarInitials,
    children,
    language,
    className,
    itemContainerRef,
    scrollableRef,
    styleSet,
    timestampClassName
  }) => {
    const fromUser = activity.from.role === 'user';
    const ariaLabel = localize('Bot said something', language, avatarInitials, activity.text, activity.timestamp)
    const activityDisplayText =
      (
        activity.channelData
        && activity.channelData.messageBack
        && activity.channelData.messageBack.displayText
      ) || activity.text;

    return (
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.carouselFilmStrip + '',
          (className || '') + ''
        ) }
        ref={ scrollableRef }
      >
        <Avatar
          aria-hidden={ true }
          className="avatar"
          fromUser={ fromUser }
        />
        <div className="content">
          {
            !!activityDisplayText &&
              <div className="message">
                <Bubble
                  aria-label={ ariaLabel }
                  className="bubble"
                  fromUser={ fromUser }
                >
                  { children({
                    activity,
                    attachment: {
                      contentType: textFormatToContentType(activity.textFormat),
                      content: activityDisplayText
                    }
                  }) }
                </Bubble>
                <div className="filler" />
              </div>
          }
          <ul ref={ itemContainerRef }>
            {
              activity.attachments.map((attachment, index) =>
                <li key={ index }>
                  <Bubble
                    fromUser={ fromUser }
                    key={ index }
                  >
                    { children({ attachment }) }
                  </Bubble>
                </li>
              )
            }
          </ul>
          <div
            aria-hidden={ true }
            className="webchat__row"
          >
            {(
              activity.channelData
              && (
                activity.channelData.state === SENDING
                || activity.channelData.state === SEND_FAILED
              )
            ) ?
              <SendStatus activity={ activity } />
            :
              <Timestamp
                activity={ activity }
                className={ timestampClassName }
              />
            }
          </div>
        </div>
      </div>
    );
  }
)

export default props =>
  <FilmContext.Consumer>
    { ({ itemContainerRef, scrollableRef }) =>
      <ConnectedCarouselFilmStrip
        itemContainerRef={ itemContainerRef }
        scrollableRef={ scrollableRef }
        { ...props }
      />
    }
  </FilmContext.Consumer>

export { connectCarouselFilmStrip }
