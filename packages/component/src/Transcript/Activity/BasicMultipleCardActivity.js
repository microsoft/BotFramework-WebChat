import BasicFilm from 'react-film';
import React from 'react';

import ActivityContext from './Context';
import Avatar from './Avatar';
import BasicCard from './Card/BasicCard';
import CardComposer from './Card/Composer';
import MainContext from '../../Context';
import TimeAgo from './TimeAgo';

export default ({ children }) =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity: { cards } }) =>
          <BasicFilm
            showDots={ false }
          >
            <Avatar />
            {
              cards.map((card, index) =>
                <div key={ card.id } className={ styleSet.multipleCardActivityCard + '' }>
                  <CardComposer card={ card }>
                    <BasicCard>
                      { children }
                    </BasicCard>
                  </CardComposer>
                  { index === 0 && <TimeAgo /> }
                </div>
              )
            }
          </BasicFilm>
        }
      </ActivityContext.Consumer>
    }
  </MainContext.Consumer>
