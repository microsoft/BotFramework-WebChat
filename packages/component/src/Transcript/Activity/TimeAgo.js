import React from 'react';

import ActivityContext from './Context';
import MainContext from '../../Context';
import TimeAgo from '../../Utils/TimeAgo';

export default () =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity: { timestamp } }) =>
          <span className={ styleSet.timestamp }>
            <TimeAgo value={ timestamp } />
          </span>
        }
      </ActivityContext.Consumer>
    }
  </MainContext.Consumer>
