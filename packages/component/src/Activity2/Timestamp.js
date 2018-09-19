import React from 'react';

import Context from '../Context';
import TimeAgo from '../Utils/TimeAgo';

export default ({ activity: { timestamp } }) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <span className={ styleSet.timestamp }>
        <TimeAgo value={ timestamp } />
      </span>
    }
  </Context.Consumer>
