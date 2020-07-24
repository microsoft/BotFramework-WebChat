import { Constants } from 'botframework-webchat-core';
import React from 'react';

import SendStatus from './SendStatus/SendStatus';

const {
  ActivityClientState: { SENT }
} = Constants;

export default function createSendStatusMiddleware() {
  return () => next => ({ activity, sendState, ...args }) => {
    if (sendState !== SENT) {
      // This is not a React component, but a render function.
      /* eslint-disable-next-line react/display-name */
      return <SendStatus activity={activity} sendState={sendState} />;
    }

    return next({ activity, sendState, ...args });
  };
}
