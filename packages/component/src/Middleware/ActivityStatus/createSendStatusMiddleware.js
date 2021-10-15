import { Constants } from 'botframework-webchat-core';
import React from 'react';

import SendStatus from './SendStatus/SendStatus';

const {
  ActivityClientState: { SENT }
} = Constants;

export default function createSendStatusMiddleware() {
  return () =>
    next =>
    // This is not a React component.
    // eslint-disable-next-line react/prop-types
    ({ activity, sendState, ...args }) => {
      if (sendState !== SENT) {
        return <SendStatus activity={activity} sendState={sendState} />;
      }

      return next({ activity, sendState, ...args });
    };
}
