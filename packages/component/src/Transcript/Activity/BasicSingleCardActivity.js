import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import ActivityContext from './Context';
import Avatar from './Avatar';
import BasicCard from './Card/BasicCard';
import CardComposer from './Card/Composer';
import MainContext from '../../Context';
import TimeAgo from './TimeAgo';

const ROOT_CSS = css({
  display: 'flex',

  '&.from-user': {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end'
  },

  '& > .bubble-box': {
    overflow: 'hidden',
    flexGrow: 10000
  },

  '& > .filler': {
    flexGrow: 1,
    flexShrink: 10000
  }
});

const AVATAR_CSS = css({
  flexShrink: 0
});

export default ({ children }) =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity: { cards: [card], from } }) =>
          <div className={ classNames(ROOT_CSS + '', styleSet.singleCardActivity + '', { 'from-user': from === 'user' }) }>
            <React.Fragment>
              <Avatar className={ AVATAR_CSS } />
              <div className="bubble-box">
                { children(card) }
                <TimeAgo />
              </div>
              <div className="filler" />
            </React.Fragment>
          </div>
        }
      </ActivityContext.Consumer>
    }
  </MainContext.Consumer>
