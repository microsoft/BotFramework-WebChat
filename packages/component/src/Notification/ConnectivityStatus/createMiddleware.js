import React from 'react';

import ConnectivityStatusConnected from './Connected';
import ConnectivityStatusConnecting from './Connecting';
import ConnectivityStatusFailedToConnect from './FailedToConnect';
import ConnectivityStatusJavaScriptError from './JavaScriptError';
import ConnectivityStatusReconnecting from './Reconnecting';

function createConnectivityStatusMiddleware() {
  return () => next => notification => {
    const { id, message } = notification;

    if (id !== 'connectivitystatus') {
      return next(notification);
    }

    switch (message) {
      case 'connecting':
        return <ConnectivityStatusConnecting />;

      case 'javascripterror':
        return <ConnectivityStatusJavaScriptError />;

      case 'failedtoconnect':
        return <ConnectivityStatusFailedToConnect />;

      case 'reconnecting':
        return <ConnectivityStatusReconnecting />;

      case 'connected':
      default:
        return <ConnectivityStatusConnected />;
    }
  };
}

export default createConnectivityStatusMiddleware;
