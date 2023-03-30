import { useRef } from 'react';
import updateIn from 'simple-update-in';

import findMin from '../utils/findMin';
import Notification from '../types/Notification';
import useForceRender from './internal/useForceRender';
import useNotifications from './useNotifications';
import usePonyfill from './usePonyfill';
import useStyleOptions from './useStyleOptions';
import useTimer from './internal/useTimer';

type DebouncedNotification = Notification & {
  outOfDate: boolean;
  updateNotBefore: number;
};

type DebouncedNotifications = { [id: string]: DebouncedNotification };

function getEarliestUpdateNotBefore(notificationMap: DebouncedNotifications) {
  return findMin(
    Object.values(notificationMap)
      .filter(({ outOfDate }) => outOfDate)
      .map(({ updateNotBefore }) => updateNotBefore)
  );
}

function useDebouncedNotifications(): [DebouncedNotifications] {
  const [{ Date }] = usePonyfill();
  const [{ notificationDebounceTimeout }] = useStyleOptions();
  const [notifications] = useNotifications();
  const debouncedNotificationsRef = useRef({});
  const forceRender = useForceRender();

  const now = Date.now();

  // Delete notifications or mark them to be deleted if debouncing.
  for (const id of Object.keys(debouncedNotificationsRef.current).filter(id => !(id in notifications))) {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => {
      if (now < debouncedNotification.updateNotBefore) {
        // The update need to be postponed.
        return { ...debouncedNotification, outOfDate: true };
      }

      // Otherwise, return undefined will remove it.
    });
  }

  // For any changes, update notifications or mark them to be updated if debouncing.
  for (const [, { alt, data, id, level, message, timestamp }] of Object.entries(notifications)) {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => {
      if (
        debouncedNotification &&
        alt === debouncedNotification.alt &&
        Object.is(data, debouncedNotification.data) &&
        level === debouncedNotification.level &&
        message === debouncedNotification.message &&
        timestamp === debouncedNotification.timestamp
      ) {
        // If nothing changed, return as-is.
        return debouncedNotification;
      }

      if (debouncedNotification && now < debouncedNotification.updateNotBefore) {
        // The update need to be postponed.
        return {
          ...debouncedNotification,
          outOfDate: true
        };
      }

      // Update the notification.
      return {
        ...debouncedNotification,
        alt,
        data,
        id,
        level,
        message,
        outOfDate: false,
        timestamp,
        updateNotBefore: now + notificationDebounceTimeout
      };
    });
  }

  useTimer(getEarliestUpdateNotBefore(debouncedNotificationsRef.current), forceRender);

  return [debouncedNotificationsRef.current];
}

export default useDebouncedNotifications;

export { getEarliestUpdateNotBefore };
