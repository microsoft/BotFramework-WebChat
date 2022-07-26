import React, { useEffect, useMemo, useRef } from 'react';

import { isSelfActivity, isSelfActivityInTransit } from 'botframework-webchat-core';
import ActivitySendStatusContext from './private/Context';
import freezeArray from '../../utils/freezeArray';
import isDiffMap from './private/isDiffMap';
import useActivities from '../../hooks/useActivities';
import useForceRender from '../../hooks/internal/useForceRender';
import useGetKeyByActivity from '../ActivityKeyer/useGetKeyByActivity';
import useGetSendTimeoutForActivity from '../../hooks/useGetSendTimeoutForActivity';

import type { ActivitySendStatusContextType } from './private/Context';
import type { FC } from 'react';
import type { SendStatus } from './SendStatus';

// Magic numbers for `expiryByActivityKey`.
const EXPIRY_SEND_FAILED = -Infinity;
const EXPIRY_SENT = Infinity;

const ActivitySendStatusComposer: FC = ({ children }) => {
  const [activities] = useActivities();
  const forceRender = useForceRender();
  const getKeyByActivity = useGetKeyByActivity();
  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();
  const sendStatusByActivityKeyRef = useRef<ReadonlyMap<string, SendStatus>>(Object.freeze(new Map()));

  /**
   * A key/value map to stores when the outgoing activity is going to expire.
   *
   * The key is the activity key.
   *
   * The value is:
   * - `Infinity` if the activity is already sent (and will never expire), otherwise;
   * - `-Infinity` if the activity failed to send (a.k.a. already expired), otherwise;
   * - An epoch time of when the activity will be expired.
   */
  // TODO: [P*] We could build a `useMemoMap()` hook to memoize mapper function more efficiently.
  const expiryByActivityKey = useMemo<ReadonlyMap<string, number>>(
    () =>
      Object.freeze(
        activities.reduce<Map<string, number>>((expiryByActivityKey, activity) => {
          if (isSelfActivity(activity)) {
            const key = getKeyByActivity(activity);

            if (key) {
              if (!isSelfActivityInTransit(activity)) {
                expiryByActivityKey.set(key, EXPIRY_SENT);
              } else if (activity.channelData['webchat:send-status'] === 'send failed') {
                expiryByActivityKey.set(key, EXPIRY_SEND_FAILED);
              } else {
                const expiry = +new Date(activity.localTimestamp) + getSendTimeoutForActivity({ activity });

                expiry && expiryByActivityKey.set(key, expiry);
              }
            }
          }

          return expiryByActivityKey;
        }, new Map())
      ),
    [activities, getKeyByActivity, getSendTimeoutForActivity]
  );

  // Turns the expiry (epoch time) into `SendStatus`, which is based on current clock.
  const nextSendStatusByActivityKey = new Map<string, SendStatus>();
  const now = Date.now();

  for (const [key, expiry] of expiryByActivityKey) {
    nextSendStatusByActivityKey.set(key, expiry === EXPIRY_SENT ? 'sent' : expiry > now ? 'sending' : 'send failed');
  }

  // Checks the result for memoization.
  if (isDiffMap(sendStatusByActivityKeyRef.current, nextSendStatusByActivityKey)) {
    sendStatusByActivityKeyRef.current = Object.freeze(nextSendStatusByActivityKey);
  }

  // Gets/realizes the `current` from `ref` because we need to use it for `deps` array in hooks for memoization.
  const { current: sendStatusByActivityKey } = sendStatusByActivityKeyRef;

  const sendStatusByActivityKeyState = useMemo(() => freezeArray([sendStatusByActivityKey]), [sendStatusByActivityKey]);

  const context = useMemo<ActivitySendStatusContextType>(
    () => ({
      sendStatusByActivityKeyState
    }),
    [sendStatusByActivityKeyState]
  );

  // Finds the closest expiry. This is the time we should recomputes everything.
  const nextExpiry = Array.from(expiryByActivityKey.values())
    // Ignores activities which are already marked as `"send failed"`, because the magic number its `-Infinity`.
    // We don't need to recompute them because `"send failed"` cannot change back to `"sending"` without modifying `activities` or `styleOptions`.
    .filter(expiry => expiry !== EXPIRY_SEND_FAILED)
    .sort()
    .find(expiry => expiry > now);

  // Recomputes everything (i.e. re-render) when one of the activities become expire, so the `sendStatusByActivityKey` would need to be updated.
  useEffect(() => {
    if (nextExpiry) {
      const timeout = setTimeout(forceRender, nextExpiry - Date.now());

      return () => clearTimeout(timeout);
    }
  }, [forceRender, nextExpiry]);

  return <ActivitySendStatusContext.Provider value={context}>{children}</ActivitySendStatusContext.Provider>;
};

export default ActivitySendStatusComposer;
