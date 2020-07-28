import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import Timestamp from './Timestamp';

export default function createTimestampMiddleware() {
  return () => () => (...args) => {
    const [{ activity, hideTimestamp }] = args;

    if (hideTimestamp) {
      // If "hideTimestamp" is set, we will not render the visual timestamp. But continue to render the screen reader only version.
      return <AbsoluteTime hide={true} value={activity.timestamp} />;
    }

    return <Timestamp activity={activity} />;
  };
}
