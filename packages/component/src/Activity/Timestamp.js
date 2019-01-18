import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TimeAgo from '../Utils/TimeAgo';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity: { timestamp },
    className,
    styleSet
  }) =>
    <span className={ classNames(
      styleSet.timestamp + '',
      (className || '') + ''
    ) }>
      <TimeAgo value={ timestamp } />
    </span>
)
