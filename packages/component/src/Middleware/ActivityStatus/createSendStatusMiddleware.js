import { Constants } from 'botframework-webchat-core';
import React from 'react';

import SendStatus from './SendStatus/SendStatus';

const {
  ActivityClientState: { SENDING, SEND_FAILED }
} = Constants;

export default function createSendStatusMiddleware() {
  return () => next => ({ activity, ...args }) => {
    const { channelData: { state } = {}, from: { role } = {} } = activity;

    if (role === 'user' && (state === SENDING || state === SEND_FAILED)) {
      return <SendStatus activity={activity} />;
    }

    return next({ activity, ...args });
  };
}
