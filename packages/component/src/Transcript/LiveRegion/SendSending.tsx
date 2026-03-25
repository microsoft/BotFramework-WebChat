import { hooks } from 'botframework-webchat-api';
import { memo, useMemo } from 'react';

import usePrevious from '../../hooks/internal/usePrevious';
import { useLiveRegion } from '../../providers/LiveRegionTwin';
import { SENDING } from '../../types/internal/SendStatus';
import isPresentational from './isPresentational';

const { useGetActivityByKey, useLocalizer, useSendStatusByActivityKey } = hooks;

/**
 * React component to on-demand narrate "Sending message." at the end of the live region.
 *
 * When the user sends a message the activity enters the "sending" state before the server acknowledges it.
 * The visual "Sending" indicator is rendered next to the activity, but that text is not inside an ARIA
 * live region and is therefore not announced by screen readers.
 *
 * This component watches for activities that newly enter the `sending` state and queues the localized
 * "Sending message." string into the polite live region so assistive technologies announce it.
 *
 * Presentational activities (e.g. `event` or `typing`) are excluded to reduce noise.
 */
const LiveRegionSendSending = () => {
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const getActivityByKey = useGetActivityByKey();
  const localize = useLocalizer();

  /**
   * Set of keys of outgoing and non-presentational activities that are currently being sent.
   */
  const activityKeysOfSending = useMemo<Set<string>>(
    () =>
      Array.from(sendStatusByActivityKey).reduce(
        (activityKeysOfSending, [key, sendStatus]) =>
          sendStatus === SENDING && !isPresentational(getActivityByKey(key))
            ? activityKeysOfSending.add(key)
            : activityKeysOfSending,
        new Set<string>()
      ),
    [getActivityByKey, sendStatusByActivityKey]
  );

  /** Returns localized "Sending message." */
  const liveRegionSendSendingAlt = localize('TRANSCRIPT_LIVE_REGION_SEND_SENDING_ALT');

  const prevActivityKeysOfSending = usePrevious(activityKeysOfSending);

  /** True, if one or more non-presentational activities newly entered the "sending" state, otherwise false. */
  const hasNewSending = useMemo<boolean>(() => {
    if (activityKeysOfSending === prevActivityKeysOfSending) {
      return false;
    }

    for (const key of activityKeysOfSending.keys()) {
      if (!prevActivityKeysOfSending.has(key)) {
        return true;
      }
    }

    return false;
  }, [activityKeysOfSending, prevActivityKeysOfSending]);

  useLiveRegion(() => hasNewSending && liveRegionSendSendingAlt, [hasNewSending, liveRegionSendSendingAlt]);

  return null;
};

LiveRegionSendSending.displayName = 'LiveRegionSendSending';

export default memo(LiveRegionSendSending);
