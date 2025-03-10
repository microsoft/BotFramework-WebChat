import { ActivityStatusMiddleware } from 'botframework-webchat-api';
import React from 'react';

import { SENDING, SEND_FAILED } from '../../types/internal/SendStatus';
import SendStatus from '../../ActivityStatus/SendStatus/SendStatus';

export default function createSendStatusMiddleware(): ActivityStatusMiddleware {
  return () =>
    next =>
    ({ activity, sendState, ...args }) => {
      switch (sendState) {
        case SENDING:
        case SEND_FAILED:
          return <SendStatus activity={activity} sendStatus={sendState} />;

        default:
          return next({ activity, sendState, ...args });
      }
    };
}
