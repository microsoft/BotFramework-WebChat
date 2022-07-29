import { ActivityStatusMiddleware } from 'botframework-webchat-api';
import React from 'react';

import SendStatus from './SendStatus/SendStatus';

export default function createSendStatusMiddleware(): ActivityStatusMiddleware {
  return () =>
    next =>
    // This is not a React component.
    // eslint-disable-next-line react/prop-types
    ({ activity, sendState, ...args }) => {
      switch (sendState) {
        case 'sending':
        case 'send failed':
          return <SendStatus activity={activity} sendStatus={sendState} />;

        default:
          return next({ activity, sendState, ...args });
      }
    };
}
