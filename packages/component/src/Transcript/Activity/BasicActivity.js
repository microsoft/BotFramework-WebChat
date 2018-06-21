import { css } from 'glamor';
import React from 'react';

import ActivityContext from './Context';
import Avatar from './Avatar';
import BasicCard from './Card/BasicCard';
import CardComposer from './Card/Composer';
import MainContext from '../../Context';
import TimeAgo from '../../Utils/TimeAgo';

const ROOT_CSS = css({
  display: 'flex',
  paddingBottom: 10,

  '& > .bubble-box': {
    flex: 1,
    overflow: 'hidden'
  },

  '& > .filler': {
    width: 60
  }
});

const AVATAR_CSS = css({
  flexShrink: 0,
  marginLeft: 10,
  marginRight: 10
});

export default ({ children }) =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <li className={ ROOT_CSS }>
        <ActivityContext.Consumer>
          { ({ activity: { cards: [card], timestamp } }) =>
            <React.Fragment>
              <Avatar
                className={ AVATAR_CSS }
              />
              <div className="bubble-box">
                <CardComposer card={ card }>
                  <BasicCard>
                    { children }
                  </BasicCard>
                </CardComposer>
                <span className={ styleSet.timestamp }>
                  <TimeAgo value={ timestamp } />
                </span>
              </div>
              <div className="filler" />
            </React.Fragment>
          }
        </ActivityContext.Consumer>
      </li>
    }
  </MainContext.Consumer>
