import React from 'react';

import Timestamp from './Timestamp';

export default function createTimestampMiddleware() {
  return () => next => ({ activity, sameTimestampGroup, ...args }) => {
    if (!sameTimestampGroup) {
      return <Timestamp activity={activity} />;
    }

    return next({ activity, sameTimestampGroup, ...args });
  };
}
