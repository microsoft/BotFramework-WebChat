import { hooks } from 'botframework-webchat-api';
import { useIsSending } from 'botframework-webchat-api/internal.js';
import { memo, useEffect, useState } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useLiveRegion } from '../../providers/LiveRegionTwin';

const { useLocalizer, usePonyfill } = hooks;

const SENDING_ANNOUNCEMENT_DELAY = 3_000;

/**
 * React component to narrate "Sending message." into the live region once, when outgoing activities
 * have been in the `sending` state for 3 seconds.
 *
 * Fast sends (acknowledged by the server within 3 seconds) stay silent to avoid noisy
 * announcements. Slow or stalled sends get narrated so the user knows what is happening.
 */
const LiveRegionLongSend = () => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [isSending] = useIsSending();
  const localize = useLocalizer();

  // A ref, so a language change does not narrate it again.
  const liveRegionSendSendingAltRef = useRefFrom(localize('TRANSCRIPT_LIVE_REGION_SEND_SENDING_ALT'));

  // Invalidate will queue the announcement.
  const [tick, setTick] = useState<object | undefined>();

  useEffect(() => {
    if (!isSending) {
      return;
    }

    const timeout = setTimeout(() => setTick({}), SENDING_ANNOUNCEMENT_DELAY);

    return () => clearTimeout(timeout);
  }, [clearTimeout, isSending, setTimeout]);

  useLiveRegion(() => (tick ? liveRegionSendSendingAltRef.current : false), [liveRegionSendSendingAltRef, tick]);

  return null;
};

LiveRegionLongSend.displayName = 'LiveRegionLongSend';

export default memo(LiveRegionLongSend);
