import { hooks } from 'botframework-webchat-api';
import { useEffect, useMemo } from 'react';
import type { VFC } from 'react';

import { SEND_FAILED } from '../../types/internal/SendStatus';
import isPresentational from './isPresentational';
import usePrevious from '../../hooks/internal/usePrevious';
import useQueueStaticElement from '../../providers/LiveRegionTwin/useQueueStaticElement';

const { useGetActivityByKey, useLocalizer, useSendStatusByActivityKey } = hooks;

/**
 * React component to on-demand narrate "Failed to send message" at the end of the live region.
 *
 * We cannot narrate "failed to send message" next to the activity. At the time when the activity is being sent,
 * the activity is also queued to the screen reader. And at that moment, we not yet know if the activity can be sent or not.
 *
 * We only know when the activity was failed to send at a later time.
 *
 * Thus, we need to use a live region "footnote" to indicate the message was failed to send.
 */
const LiveRegionSendFailed: VFC<{}> = () => {
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const getActivityByKey = useGetActivityByKey();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  /**
   * List of keys of outgoing and non-presentational activities that are failed to send.
   *
   * Activities which are presentational, such as `event` or `typing`, are ignored to reduce confusions.
   * "Failed to send message" should not be narrated for presentational activities.
   */
  const activityKeysOfSendFailed = useMemo<Set<string>>(
    () =>
      Array.from(sendStatusByActivityKey).reduce(
        (activityKeysOfSendFailed, [key, sendStatus]) =>
          sendStatus === SEND_FAILED && !isPresentational(getActivityByKey(key))
            ? activityKeysOfSendFailed.add(key)
            : activityKeysOfSendFailed,
        new Set<string>()
      ),
    [getActivityByKey, sendStatusByActivityKey]
  );

  /** Returns localized "Failed to send message." */
  const liveRegionSendFailedAlt = localize('TRANSCRIPT_LIVE_REGION_SEND_FAILED_ALT');

  const prevActivityKeysOfSendFailed = usePrevious(activityKeysOfSendFailed);

  /** True, if one or more non-presentational activities start appears as "send failed", otherwise, false. */
  const hasNewSendFailed = useMemo<boolean>(() => {
    if (activityKeysOfSendFailed === prevActivityKeysOfSendFailed) {
      return false;
    }

    for (const key of activityKeysOfSendFailed.keys()) {
      if (!prevActivityKeysOfSendFailed.has(key)) {
        return true;
      }
    }

    return false;
  }, [activityKeysOfSendFailed, prevActivityKeysOfSendFailed]);

  useEffect(() => {
    hasNewSendFailed && queueStaticElement(liveRegionSendFailedAlt);
  }, [hasNewSendFailed, liveRegionSendFailedAlt, queueStaticElement]);

  return null;
};

export default LiveRegionSendFailed;
