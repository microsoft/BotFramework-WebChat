import { ActivityStatusMiddleware } from 'botframework-webchat-api';
import React from 'react';

import { SENDING, SEND_FAILED } from '../../types/internal/SendStatus';
import SendStatus from '../../ActivityStatus/SendStatus/SendStatus';
import Slotted from '../../ActivityStatus/Slotted';

export default function createSendStatusMiddleware(): ActivityStatusMiddleware {
  return () =>
    next =>
    // This is not a React component.
    // eslint-disable-next-line react/prop-types
    ({ activity, sendState, ...args }) => {
      switch (sendState) {
        case SENDING:
        case SEND_FAILED:
          return (
            <Slotted>
              <SendStatus activity={activity} sendStatus={sendState} />
            </Slotted>
          );

        default:
          return next({ activity, sendState, ...args });
      }
    };
}
