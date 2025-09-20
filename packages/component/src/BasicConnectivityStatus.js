import { hooks } from 'botframework-webchat-api';
import React from 'react';

import ConnectivityStatusConnected from './ConnectivityStatus/Connected';
import ConnectivityStatusConnecting from './ConnectivityStatus/Connecting';
import ConnectivityStatusFailedToConnect from './ConnectivityStatus/FailedToConnect';
import ConnectivityStatusJavaScriptError from './ConnectivityStatus/JavaScriptError';

const { useDebouncedNotifications } = hooks;

const BasicConnectivityStatus = ({ className }) => {
  const [{ connectivitystatus: connectivityStatus }] = useDebouncedNotifications();

  if (!connectivityStatus) {
    return null;
  }

  switch (connectivityStatus.message) {
    case 'connecting':
      return <ConnectivityStatusConnecting className={className} />;

    case 'javascripterror':
      return <ConnectivityStatusJavaScriptError className={className} />;

    case 'failedtoconnect':
      return <ConnectivityStatusFailedToConnect className={className} />;

    case 'reconnecting':
      return <ConnectivityStatusConnecting className={className} reconnect={true} />;

    case 'connected':
    default:
      return <ConnectivityStatusConnected className={className} />;
  }
};

export default BasicConnectivityStatus;
