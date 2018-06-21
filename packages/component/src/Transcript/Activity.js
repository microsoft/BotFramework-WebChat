import { css } from 'glamor';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import TimeAgo from './TimeAgo';

const ROOT_CSS = css({
  display: 'flex',
  padding: 10,

  '& > .bubble-box': {
    flex: 1,
    overflow: 'hidden'
  },

  '& > .filler': {
    width: 50
  }
});

const AVATAR_CSS = css({
  flexShrink: 0,
  marginLeft: 10,
  marginRight: 10
});

export default props =>
  <Context.Consumer>
    { context =>
      <li className={ ROOT_CSS }>
        <Avatar
          className={ AVATAR_CSS }
        />
        <div className="bubble-box">
          <Bubble
            image={ props.attachment }
          >
            { props.children }
          </Bubble>
          <span className={ context.styleSet.timestamp }>
            <TimeAgo value={ props.timestamp } />
          </span>
        </div>
        <div className="filler" />
      </li>
    }
  </Context.Consumer>
