import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import Timestamp from './Timestamp';

export default function createTimestampMiddleware() {
  return () => () => args => {
    const { activity, hideTimestamp } = args;

    if (hideTimestamp) {
      return <AbsoluteTime hide={true} value={activity.timestamp} />;
    }

    return <Timestamp activity={activity} />;
  };
}
