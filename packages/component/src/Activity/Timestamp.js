import React from 'react';

import connectWithContext from '../connectWithContext';
import TimeAgo from '../Utils/TimeAgo';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity: { timestamp },
    styleSet
  }) =>
    <span className={ styleSet.timestamp }>
      <TimeAgo value={ timestamp } />
    </span>
)
