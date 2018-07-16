import BasicFilm from 'react-film';
import React from 'react';

import { withActivity } from './Context';
import { withStyleSet } from '../../Context';
import Avatar from './Avatar';
import Bubble from './Bubble';
import TimeAgo from './TimeAgo';

export default withStyleSet(withActivity(({ activity: { cards }, children, styleSet }) =>
  <BasicFilm
    showDots={ false }
    showScrollBar={ false }
  >
    <Avatar />
    {
      cards.map((card, index) =>
        <div key={ card.id } className={ styleSet.multipleCardActivityCard + '' }>
          <Bubble>
            { !!children && children(card) }
          </Bubble>
          { index === 0 && <TimeAgo /> }
        </div>
      )
    }
  </BasicFilm>
))
