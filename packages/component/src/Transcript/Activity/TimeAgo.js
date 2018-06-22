import React from 'react';

import { withStyleSet } from '../../Context';
import ActivityContext from './Context';
import TimeAgo from '../../Utils/TimeAgo';

export default withStyleSet(({ styleSet }) =>
  <ActivityContext.Consumer>
    { ({ activity: { timestamp } }) =>
      <span className={ styleSet.timestamp }>
        <TimeAgo value={ timestamp } />
      </span>
    }
  </ActivityContext.Consumer>
)
