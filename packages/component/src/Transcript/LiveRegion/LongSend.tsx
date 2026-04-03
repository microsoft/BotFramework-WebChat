import { hooks } from 'botframework-webchat-api';
import { memo, useEffect, useState } from 'react';

import { useLiveRegion } from '../../providers/LiveRegionTwin';

const { useIsSending, useLocalizer, usePonyfill } = hooks;

const SENDING_ANNOUNCEMENT_INTERVAL = 3_000;

/**
 * React component to narrate "Sending message." into the live region repeatedly every 3 seconds,
 * but only while there are outgoing activities stuck in the `sending` state with none timed out.
 *
 * Fast sends (acknowledged by the server within 3 seconds) stay silent to avoid noisy
 * announcements. Slow or stalled sends get narrated so the user knows what is happening.
 */
const LiveRegionLongSend = () => {
  const [{ clearInterval, setInterval }] = usePonyfill();
  const [isSending] = useIsSending();
  const localize = useLocalizer();

  const liveRegionSendSendingAlt = localize('TRANSCRIPT_LIVE_REGION_SEND_SENDING_ALT');

  // Invalidate will queue the announcement.
  const [tick, setTick] = useState<object | undefined>();

  useEffect(() => {
    if (!isSending) {
      return;
    }

    const interval = setInterval(() => setTick({}), SENDING_ANNOUNCEMENT_INTERVAL);

    return () => clearInterval(interval);
  }, [clearInterval, isSending, setInterval]);

  useLiveRegion(() => (tick ? liveRegionSendSendingAlt : false), [liveRegionSendSendingAlt, tick]);

  return null;
};

LiveRegionLongSend.displayName = 'LiveRegionLongSend';

export default memo(LiveRegionLongSend);
