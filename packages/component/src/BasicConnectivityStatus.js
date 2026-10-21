import { hooks } from 'botframework-webchat-api';
import React from 'react';

import ConnectivityStatusConnecting from './ConnectivityStatus/Connecting';
import ConnectivityStatusFailedToConnect from './ConnectivityStatus/FailedToConnect';
import ConnectivityStatusJavaScriptError from './ConnectivityStatus/JavaScriptError';

const { useDebouncedNotifications } = hooks;

const BasicConnectivityStatus = ({ className }) => {
  const [{ connectivitystatus: connectivityStatus }] = useDebouncedNotifications();

  switch (connectivityStatus?.message) {
    case 'connecting':
      return <ConnectivityStatusConnecting className={className} />;

    case 'javascripterror':
      return <ConnectivityStatusJavaScriptError className={className} />;

    case 'failedtoconnect':
      return <ConnectivityStatusFailedToConnect className={className} />;

    case 'reconnecting':
      return <ConnectivityStatusConnecting className={className} reconnect={true} />;

    // Connected: render nothing, visually or for screen readers, so browse mode goes from the transcript straight to the send box.
    case 'connected':
    default:
      return null;
  }
};

export default BasicConnectivityStatus;
