import { ActivityStatusMiddleware } from 'botframework-webchat-api';
import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import Timestamp from './Timestamp';

export default function createTimestampMiddleware(): ActivityStatusMiddleware {
  return () =>
    () =>
    (...args) => {
      const [{ activity, hideTimestamp }] = args;

      if (typeof activity.timestamp === 'undefined') {
        // TODO: [P*] ActivityStatusMiddleware is using a legacy UI middleware pattern which does not supports returning `false`.
        //       If the activity is sent and there is no timestamp, probably we will just not displaying the timestamp.
        //       Or we somehow enforce all activities must have timestamp.
        return <div />;
      } else if (hideTimestamp) {
        // If "hideTimestamp" is set, we will not render the visual timestamp. But continue to render the screen reader only version.
        return <AbsoluteTime hide={true} value={activity.timestamp} />;
      }

      return <Timestamp activity={activity} />;
    };
}
