import { useRef } from 'react';
import updateIn from 'simple-update-in';

import { map as minOfMap } from '../Utils/minOf';
import filterMap from '../Utils/filterMap';
import useForceRender from './internal/useForceRender';
import useNotifications from './useNotifications';
import useStyleOptions from './useStyleOptions';
import useTimer from './internal/useTimer';

function useDebouncedNotifications() {
  const now = Date.now();

  const [{ notificationDebounceTimeout }] = useStyleOptions();
  const [notifications] = useNotifications();
  const debouncedNotificationsRef = useRef({});
  const forceRefresh = useForceRender();

  // const forceRefresh = useCallback(() => {
  //   console.group('useDebouncedNotifications.forceRefresh');
  //   console.log(notifications);
  //   console.log(debouncedNotificationsRef.current);
  //   console.groupEnd();

  //   coreForceRefresh();
  // }, [coreForceRefresh]);

  // TODO: [P2] We can improve performance if we can keep debouncedNotificationsRef unchanged if possible.
  debouncedNotificationsRef.current = filterMap(
    debouncedNotificationsRef.current,
    ({ id, updateNotBefore }) => notifications[id] || now < updateNotBefore
  );

  for (const [, { alt, id, level, message, timestamp }] of Object.entries(notifications)) {
    debouncedNotificationsRef.current = updateIn(debouncedNotificationsRef.current, [id], debouncedNotification => {
      if (
        debouncedNotification &&
        alt === debouncedNotification.alt &&
        level === debouncedNotification.level &&
        message === debouncedNotification.message &&
        timestamp === debouncedNotification.timestamp
      ) {
        return debouncedNotification;
      }

      if (debouncedNotification && now <= debouncedNotification.updateNotBefore) {
        return {
          ...debouncedNotification,
          outOfDate: true
        };
      }

      return {
        ...debouncedNotification,
        alt,
        id,
        level,
        message,
        outOfDate: false,
        timestamp,
        updateNotBefore: now + notificationDebounceTimeout
      };
    });
  }

  const [, { updateNotBefore: earliestUpdateNotBefore }] = minOfMap(
    filterMap(debouncedNotificationsRef.current, ({ outOfDate }) => outOfDate),
    ({ updateNotBefore }) => updateNotBefore
  ) || [undefined, {}];

  useTimer(earliestUpdateNotBefore, forceRefresh);

  console.group('useDebouncedNotifications');
  console.log(earliestUpdateNotBefore);
  console.log(notifications);
  console.log(debouncedNotificationsRef.current);
  console.groupEnd();

  return [debouncedNotificationsRef.current];
}

export default useDebouncedNotifications;
