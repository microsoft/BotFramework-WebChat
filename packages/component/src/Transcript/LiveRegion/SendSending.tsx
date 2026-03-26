import { hooks } from 'botframework-webchat-api';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { useLiveRegion } from '../../providers/LiveRegionTwin';
import { SENDING } from '../../types/internal/SendStatus';
import isPresentational from './isPresentational';

const { useGetActivityByKey, useLocalizer, usePonyfill, useSendStatusByActivityKey } = hooks;

const SENDING_ANNOUNCEMENT_DELAY = 3000;

/**
 * React component to narrate "Sending message." into the live region, but only when the
 * outgoing activity has been stuck in the `sending` state for at least 3 seconds.
 *
 * Fast sends (acknowledged by the server within 3 seconds) stay silent to avoid noisy
 * announcements. Slow or stalled sends get narrated so the user knows what is happening.
 *
 * Presentational activities (e.g. `event` or `typing`) are excluded to reduce noise.
 */
const LiveRegionSendSending = () => {
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const getActivityByKey = useGetActivityByKey();
  const localize = useLocalizer();
  const [{ clearTimeout, setTimeout }] = usePonyfill();

  const liveRegionSendSendingAlt = localize('TRANSCRIPT_LIVE_REGION_SEND_SENDING_ALT');

  /** Keys we have already announced "Sending message." for — prevents repeated announcements. */
  const announcedKeysRef = useRef<Set<string>>(new Set());

  /** Monotonic counter; incrementing it causes `useLiveRegion` to queue the announcement. */
  const [tick, setTick] = useState(0);

  /** Keys of outgoing non-presentational activities that are currently in the sending state. */
  const sendingKeys = useMemo<Set<string>>(() => {
    const keys = new Set<string>();

    for (const [key, sendStatus] of sendStatusByActivityKey) {
      if (sendStatus !== SENDING) continue;

      if (!isPresentational(getActivityByKey(key))) {
        keys.add(key);
      }
    }

    return keys;
  }, [getActivityByKey, sendStatusByActivityKey]);

  /**
   * Arm a per-key timer when a key newly enters `sendingKeys`.
   * Cancel all pending timers when a key leaves (cleanup handles this via deps change).
   * Clean up the `announcedKeysRef` for keys that are no longer sending.
   */
  useEffect(() => {
    // Prune announced keys that are no longer sending.
    for (const key of Array.from(announcedKeysRef.current)) {
      if (!sendingKeys.has(key)) {
        announcedKeysRef.current.delete(key);
      }
    }

    if (!sendingKeys.size) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (const key of sendingKeys) {
      if (announcedKeysRef.current.has(key)) continue;

      const timeout = setTimeout(() => {
        if (!sendingKeys.has(key)) return;

        announcedKeysRef.current.add(key);
        setTick(t => t + 1);
      }, SENDING_ANNOUNCEMENT_DELAY);

      timeouts.push(timeout);
    }

    return () => timeouts.forEach(id => clearTimeout(id));
  }, [clearTimeout, sendingKeys, setTimeout]);

  useLiveRegion(() => (tick ? liveRegionSendSendingAlt : false), [liveRegionSendSendingAlt, tick]);

  return null;
};

LiveRegionSendSending.displayName = 'LiveRegionSendSending';

export default memo(LiveRegionSendSending);
