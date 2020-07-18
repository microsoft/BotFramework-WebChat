import React from 'react';

import Timestamp from './Timestamp';

export default function createTimestampMiddleware() {
  return () => next => ({ activity, sameTimestampGroup, ...args }) => {
    if (!sameTimestampGroup) {
      // This is not a React component, but a render function.
      /* eslint-disable-next-line react/display-name */
      return () => <Timestamp activity={activity} />;
    }

    return next({ activity, sameTimestampGroup, ...args });
  };
}
