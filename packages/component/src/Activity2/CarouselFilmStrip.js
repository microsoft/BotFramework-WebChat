import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import Timestamp from './Timestamp';

import textFormatToContentType from '../Utils/textFormatToContentType';

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

const CarouselFilmStrip = ({
  activity,
  botAvatarInitials,
  children,
  className,
  filmContext,
  showTimestamp,
  styleSet,
  userAvatarInitials
}) => {
  const initials = activity.from.role === 'user' ? userAvatarInitials : botAvatarInitials;

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
        <Avatar className="avatar">{ initials }</Avatar>
      }
      <div className="content">
        {
          !!activity.text &&
            <div className="message">
              <Bubble className="bubble">
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
                <Bubble key={ index }>
                  { children({ attachment }) }
                </Bubble>
              </li>
            )
          }
        </ul>
        { showTimestamp &&
          <Timestamp activity={ activity } />
        }
      </div>
    </div>
  );
}

export default ({ children, ...props }) =>
  <FilmContext.Consumer>
    { filmContext =>
      <Context.Consumer>
        { ({
            botAvatarInitials,
            styleSet,
            userAvatarInitials
          }) =>
          <CarouselFilmStrip
            { ...props }
            botAvatarInitials={ botAvatarInitials }
            filmContext={ filmContext }
            styleSet={ styleSet }
            userAvatarInitials={ userAvatarInitials }
          >
            { children }
          </CarouselFilmStrip>
        }
      </Context.Consumer>
    }
  </FilmContext.Consumer>
