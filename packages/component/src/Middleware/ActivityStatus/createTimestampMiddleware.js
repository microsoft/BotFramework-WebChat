import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import Timestamp from './Timestamp';

export default function createTimestampMiddleware() {
  return () => () => args => {
    const { activity, hideTimestamp } = args;

    if (hideTimestamp) {
      // This is not a React component, but a render function.
      /* eslint-disable-next-line react/display-name */
      return () => <AbsoluteTime hide={true} value={activity.timestamp} />;
    }

    // This is not a React component, but a render function.
    /* eslint-disable-next-line react/display-name */
    return () => <Timestamp activity={activity} />;
  };
}
