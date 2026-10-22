import { hooks } from 'botframework-webchat-api';
import React, { useMemo } from 'react';

import ConnectivityStatusConnecting from './ConnectivityStatus/Connecting';
import ConnectivityStatusFailedToConnect from './ConnectivityStatus/FailedToConnect';
import ConnectivityStatusJavaScriptError from './ConnectivityStatus/JavaScriptError';
import useForceRender from './hooks/internal/useForceRender';
import usePrevious from './hooks/internal/usePrevious';
import useTimer from './hooks/internal/useTimer';
import { useLiveRegion } from './providers/LiveRegionTwin';

const { useDebouncedNotifications, useLocalizer, usePonyfill, useStyleOptions } = hooks;

const BasicConnectivityStatus = ({ className }) => {
  const [{ connectivitystatus: connectivityStatus }] = useDebouncedNotifications();
  const [{ Date }] = usePonyfill();
  const [{ slowConnectionAfter }] = useStyleOptions();
  const forceRender = useForceRender();
  const localize = useLocalizer();

  const message = connectivityStatus?.message;
  const connecting = message === 'connecting' || message === 'reconnecting';

  // "Slow connection" replaces "Connecting…" or "Reconnecting…" after it has been shown for `slowConnectionAfter`.
  const connectingSince = useMemo(() => (connecting ? Date.now() : undefined), [connecting, Date]);
  const slowAt = typeof connectingSince === 'number' ? connectingSince + slowConnectionAfter : undefined;

  useTimer(slowAt, forceRender);

  const slow = typeof slowAt === 'number' && slowAt <= Date.now();

  // True when the status bar announced a status (see its components), false for "Connecting…" while Web Chat starts.
  const announced =
    slow || message === 'failedtoconnect' || message === 'javascripterror' || message === 'reconnecting';
  const prevAnnounced = usePrevious(announced);

  useLiveRegion(
    () =>
      message === 'connected' &&
      prevAnnounced &&
      localize('CONNECTIVITY_STATUS_ALT', localize('CONNECTIVITY_STATUS_ALT_CONNECTED')),
    [localize, message, prevAnnounced]
  );

  switch (message) {
    case 'connecting':
      return <ConnectivityStatusConnecting className={className} slow={slow} />;

    case 'javascripterror':
      return <ConnectivityStatusJavaScriptError className={className} />;

    case 'failedtoconnect':
      return <ConnectivityStatusFailedToConnect className={className} />;

    case 'reconnecting':
      return <ConnectivityStatusConnecting className={className} reconnect={true} slow={slow} />;

    // Connected: render nothing, visually or for screen readers, so browse mode goes from the transcript straight to the send box.
    // When connected after an announced status, "Connectivity Status: Connected" is announced instead.
    case 'connected':
    default:
      return null;
  }
};

export default BasicConnectivityStatus;
