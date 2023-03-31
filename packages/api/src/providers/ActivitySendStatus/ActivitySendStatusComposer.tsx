import React, { useEffect, useMemo, useRef } from 'react';

import { SENDING, SEND_FAILED, SENT } from '../../types/internal/SendStatus';
import ActivitySendStatusContext from './private/Context';
import freezeArray from '../../utils/freezeArray';
import isMapEqual from './private/isMapEqual';
import useActivities from '../../hooks/useActivities';
import useForceRender from '../../hooks/internal/useForceRender';
import useGetKeyByActivity from '../ActivityKeyer/useGetKeyByActivity';
import useGetSendTimeoutForActivity from '../../hooks/useGetSendTimeoutForActivity';
import usePonyfill from '../../hooks/usePonyfill';

import type { ActivitySendStatusContextType } from './private/Context';
import type { FC, PropsWithChildren } from 'react';
import type { SendStatus } from '../../types/internal/SendStatus';

// Magic numbers for `expiryByActivityKey`.
const EXPIRY_SEND_FAILED = -Infinity;
const EXPIRY_SENT = Infinity;

const ActivitySendStatusComposer: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [activities] = useActivities();
  const [{ clearTimeout, Date, setTimeout }] = usePonyfill();
  const forceRender = useForceRender();
  const getKeyByActivity = useGetKeyByActivity();
  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();
  const sendStatusByActivityKeyRef = useRef<ReadonlyMap<string, SendStatus>>(Object.freeze(new Map()));

  /**
   * Map of outgoing activities and their respective expiry.
   *
   * The key is the activity key.
   *
   * The value is:
   *
   * - `Infinity` if the activity is already sent (and will never expire), otherwise;
   * - `-Infinity` if the activity failed to send (a.k.a. already expired), otherwise;
   * - An epoch time of when the activity will be expired.
   */
  const expiryByActivityKey = useMemo<ReadonlyMap<string, number>>(
    // We could build a `useMemoMap()` hook to memoize mapper function more efficiently.
    () =>
      Object.freeze(
        activities.reduce<Map<string, number>>((expiryByActivityKey, activity) => {
          if (activity.from.role === 'user') {
            const key = getKeyByActivity(activity);

            if (key) {
              const {
                channelData: { state, 'webchat:send-status': sendStatus }
              } = activity;

              // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
              // Please refer to #4362 for details. Remove on or after 2024-07-31.
              const rectifiedSendStatus = sendStatus || (state === SENT ? SENT : SENDING);

              if (rectifiedSendStatus === SENT) {
                expiryByActivityKey.set(key, EXPIRY_SENT);
              } else if (rectifiedSendStatus === SEND_FAILED) {
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
    [activities, Date, getKeyByActivity, getSendTimeoutForActivity]
  );

  /** Map of outgoing activities and their respective send status. */
  const nextSendStatusByActivityKey = new Map<string, SendStatus>();
  const now = Date.now();

  // Turns the expiry (epoch time) into `SendStatus`, which is based on current clock.
  for (const [key, expiry] of expiryByActivityKey) {
    nextSendStatusByActivityKey.set(key, expiry === EXPIRY_SENT ? SENT : now >= expiry ? SEND_FAILED : SENDING);
  }

  // Only memoize the new result if it has changed.
  if (!isMapEqual(sendStatusByActivityKeyRef.current, nextSendStatusByActivityKey)) {
    sendStatusByActivityKeyRef.current = Object.freeze(nextSendStatusByActivityKey);
  }

  // Gets/realizes the `current` from `ref` because we need to use it for `deps` array in hooks for memoization.
  const { current: sendStatusByActivityKey } = sendStatusByActivityKeyRef;

  const sendStatusByActivityKeyState = useMemo<readonly [ReadonlyMap<string, SendStatus>]>(
    () => freezeArray([sendStatusByActivityKey]),
    [sendStatusByActivityKey]
  );

  const context = useMemo<ActivitySendStatusContextType>(
    () => ({ sendStatusByActivityKeyState }),
    [sendStatusByActivityKeyState]
  );

  // Finds the closest expiry. This is the time we should recompute `sendStatusByActivityKey`.
  const nextExpiry = Array.from(expiryByActivityKey.values())
    // Ignores activities which are already marked as `"send failed"`, because the magic number its `-Infinity`.
    // We don't need to recompute them because `"send failed"` cannot change back to `"sending"` without modifying `activities` or `styleOptions`.
    .reduce((nextExpiry, expiry) => {
      // Finds the next closest expiry, exclude those that already expired.
      if (expiry > now && expiry < nextExpiry) {
        return expiry;
      }

      return nextExpiry;
    }, Infinity);

  // When the activity with closest expiry expire, recomputes everything so the `sendStatusByActivityKey` will be updated.
  useEffect(() => {
    if (nextExpiry) {
      const timeout = setTimeout(forceRender, nextExpiry - Date.now());

      return () => clearTimeout(timeout);
    }
  }, [clearTimeout, Date, forceRender, nextExpiry, setTimeout]);

  return <ActivitySendStatusContext.Provider value={context}>{children}</ActivitySendStatusContext.Provider>;
};

export default ActivitySendStatusComposer;
