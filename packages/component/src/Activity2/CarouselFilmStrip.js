import { Context } from 'react-film';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Timestamp from './Timestamp';

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

export default ({ activity, children, className }) =>
  <Context.Consumer>
    { context =>
      <div
        className={ classNames(
          ROOT_CSS + '',
          (className || '') + ''
        ) }
        ref={ context._setFilmStripRef }
      >
        <Avatar className="avatar" />
        <div className="content">
          {
            !!activity.text &&
              <div className="message">
                <Bubble className="bubble">
                  { children({
                    contentType: 'text/markdown',
                    content: { text: activity.text }
                  }) }
                </Bubble>
                <div className="filler" />
              </div>
          }
          <ul>
            {
              activity.attachments.map((attachment, index) =>
                <li key={ index }>
                  <Bubble debug={ attachment } key={ index }>
                    { children(attachment) }
                  </Bubble>
                </li>
              )
            }
          </ul>
          <Timestamp activity={ activity } />
        </div>
      </div>
    }
  </Context.Consumer>
