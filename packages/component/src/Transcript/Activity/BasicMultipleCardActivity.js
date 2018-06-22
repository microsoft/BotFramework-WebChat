import BasicFilm from 'react-film';
import React from 'react';

import ActivityContext from './Context';
import Avatar from './Avatar';
import MainContext from '../../Context';
import TimeAgo from './TimeAgo';

export default ({ children }) =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity: { cards } }) =>
          <BasicFilm
            showDots={ false }
            showScrollBar={ false }
          >
            <Avatar />
            {
              cards.map((card, index) =>
                <div key={ card.id } className={ styleSet.multipleCardActivityCard + '' }>
                  { children(card) }
                  { index === 0 && <TimeAgo /> }
                </div>
              )
            }
          </BasicFilm>
        }
      </ActivityContext.Consumer>
    }
  </MainContext.Consumer>
