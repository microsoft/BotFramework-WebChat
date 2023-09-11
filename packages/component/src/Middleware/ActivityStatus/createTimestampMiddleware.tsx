import { ActivityStatusMiddleware } from 'botframework-webchat-api';
import React, { Fragment } from 'react';

import AbsoluteTime from '../../ActivityStatus/AbsoluteTime';
import OthersActivityStatus from '../../ActivityStatus/OthersActivityStatus';
import SelfActivityStatus from '../../ActivityStatus/SelfActivityStatus';

export default function createTimestampMiddleware(): ActivityStatusMiddleware {
  return () =>
    () =>
    (...args) => {
      const [{ activity, hideTimestamp }] = args;

      if (typeof activity.timestamp === 'undefined') {
        // ActivityStatusMiddleware is using a legacy UI middleware pattern which does not supports returning `false`.
        // If the activity is sent and there is no timestamp, probably we will just not displaying the timestamp.
        // Or we somehow enforce all activities must have timestamp.
        return <Fragment />;
      } else if (hideTimestamp) {
        // If "hideTimestamp" is set, we will not render the visual timestamp. But continue to render the screen reader only version.
        return <AbsoluteTime hide={true} value={activity.timestamp} />;
      } else if (activity.from.role === 'bot') {
        return <OthersActivityStatus activity={activity} />;
      }

      return <SelfActivityStatus activity={activity} />;
    };
}
