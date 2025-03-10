import { hooks } from 'botframework-webchat-api';
import React from 'react';

import ConnectivityStatusConnected from './ConnectivityStatus/Connected';
import ConnectivityStatusConnecting from './ConnectivityStatus/Connecting';
import ConnectivityStatusFailedToConnect from './ConnectivityStatus/FailedToConnect';
import ConnectivityStatusJavaScriptError from './ConnectivityStatus/JavaScriptError';

const { useDebouncedNotifications } = hooks;

const BasicConnectivityStatus = () => {
  const [{ connectivitystatus: connectivityStatus }] = useDebouncedNotifications();

  if (!connectivityStatus) {
    return false;
  }

  switch (connectivityStatus.message) {
    case 'connecting':
      return <ConnectivityStatusConnecting />;

    case 'javascripterror':
      return <ConnectivityStatusJavaScriptError />;

    case 'failedtoconnect':
      return <ConnectivityStatusFailedToConnect />;

    case 'reconnecting':
      return <ConnectivityStatusConnecting reconnect={true} />;

    case 'connected':
    default:
      return <ConnectivityStatusConnected />;
  }
};

export default BasicConnectivityStatus;
