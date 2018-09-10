import { css } from 'glamor';
import { Context as FilmContext } from 'react-film';
import classNames from 'classnames';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import Timestamp from './Timestamp';

import textFormatToContentType from '../Utils/textFormatToContentType';

// TODO: Put this into StyleSet
const ROOT_CSS = css({
  display: 'flex',
  MsOverflowStyle: 'none',
  overflowX: 'scroll',
  overflowY: 'hidden',
  paddingLeft: 10,
  paddingRight: 10,
  touchAction: 'manipulation',
  WebkitOverflowScrolling: 'touch',

  '&::-webkit-scrollbar': {
    display: 'none'
  },

  '& > .avatar': {
    flexShrink: 0,
    marginRight: 10,
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

      '&:not(:first-child)': {
        marginTop: 10
      },

      '& > li': {
        flex: 1,
        marginRight: 10,
        minWidth: 250,
        maxWidth: 480
      }
    }
  }
});

const CarouselFilmStrip = ({ activity, children, className, context, filmContext, showTimestamp }) => {
  const initials = activity.from.role === 'user' ? context.userAvatarInitials : context.botAvatarInitials;

  return (
    <div
      className={ classNames(
        ROOT_CSS + '',
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
        { context =>
          <CarouselFilmStrip
            { ...props }
            context={ context }
            filmContext={ filmContext }
          >
            { children }
          </CarouselFilmStrip>
        }
      </Context.Consumer>
    }
  </FilmContext.Consumer>
