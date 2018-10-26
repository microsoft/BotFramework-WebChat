import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TimeAgo from '../Utils/TimeAgo';

export default connectToWebChat(
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
