import BasicFilm from 'react-film';
import React from 'react';

import { withStyleSet } from '../../Context';
import ActivityContext from './Context';
import Avatar from './Avatar';
import TimeAgo from './TimeAgo';

export default withStyleSet(({ children, styleSet }) =>
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
)
