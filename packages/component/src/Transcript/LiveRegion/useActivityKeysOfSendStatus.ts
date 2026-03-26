import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import type { SendStatus } from '../../types/internal/SendStatus';
import isPresentational from './isPresentational';

const { useGetActivityByKey, useSendStatusByActivityKey } = hooks;

/**
 * Returns the set of keys of outgoing non-presentational activities that currently
 * have the given send status.
 *
 * Presentational activities (e.g. `event` or `typing`) are excluded to reduce noise.
 */
export default function useActivityKeysOfSendStatus(status: SendStatus): Set<string> {
  const [sendStatusByActivityKey] = useSendStatusByActivityKey();
  const getActivityByKey = useGetActivityByKey();

  return useMemo<Set<string>>(() => {
    const keys = new Set<string>();

    for (const [key, sendStatus] of sendStatusByActivityKey) {
      if (sendStatus === status && !isPresentational(getActivityByKey(key))) {
        keys.add(key);
      }
    }

    return keys;
  }, [getActivityByKey, sendStatusByActivityKey, status]);
}
