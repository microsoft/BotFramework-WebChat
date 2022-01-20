import React, { useCallback, useMemo, useState } from 'react';

import type { FC, PropsWithChildren } from 'react';

import ActivityAcknowledgementContext from './private/Context';
import findLastIndex from '../../Utils/findLastIndex';
import useGetActivityByKey from '../ActivityKeyer/useGetActivityByKey';
import useOrderedActivityKeys from '../ActivityTree/useOrderedActivityKeys';
import useValueRef from '../../hooks/internal/useValueRef';

import type { ActivityAcknowledgement } from './private/types';

type ActivityAcknowledgementComposerProps = PropsWithChildren<{}>;

const ActivityAcknowledgementComposer: FC<ActivityAcknowledgementComposerProps> = ({ children }) => {
  const [activityKeys] = useOrderedActivityKeys();
  const [lastReadActivityKey, setLastReadActivityKey] = useState<string | undefined>();
  const [rawLastAcknowledgedActivityKey, setRawLastAcknowledgedActivityKey] = useState<string | undefined>();
  const getActivityByKey = useGetActivityByKey();

  const lastAcknowledgedActivityKey = useMemo(() => {
    const lastAcknowledgedActivityKeyIndex = activityKeys.indexOf(rawLastAcknowledgedActivityKey);
    const lastEgressActivityKeyIndex = findLastIndex(activityKeys, key => getActivityByKey(key)?.from?.role === 'user');

    return ~lastEgressActivityKeyIndex
      ? activityKeys[Math.max(lastAcknowledgedActivityKeyIndex, lastEgressActivityKeyIndex)]
      : activityKeys[activityKeys.length - 1];
  }, [activityKeys, getActivityByKey, rawLastAcknowledgedActivityKey]);

  const activityKeysRef = useValueRef(activityKeys);

  const activityAcknowledgementsState = useMemo<readonly [Readonly<Map<string, ActivityAcknowledgement>>]>(() => {
    const activityAcknowledgements = new Map<string, ActivityAcknowledgement>();
    const lastAcknowledgedIndex = activityKeys.indexOf(lastAcknowledgedActivityKey);
    const lastReadIndex = activityKeys.indexOf(lastReadActivityKey);

    activityKeys.forEach((activityKey, index) => {
      activityAcknowledgements.set(activityKey, {
        acknowledged: index <= lastAcknowledgedIndex,
        read: index <= lastReadIndex
      });
    });

    return Object.freeze([Object.freeze(activityAcknowledgements)]) as readonly [
      Readonly<Map<string, ActivityAcknowledgement>>
    ];
  }, [activityKeys, lastAcknowledgedActivityKey, lastReadActivityKey]);

  // Unread means:
  // 1. Last read is not the last one in the transcript (i.e. there are something not read yet), and;
  // 2. Last read is still in the transcript.
  const hasUnreadState = useMemo<readonly [boolean]>(
    () =>
      Object.freeze([
        activityKeys[activityKeys.length - 1] !== lastReadActivityKey && !!~activityKeys.indexOf(lastReadActivityKey)
      ]) as readonly [boolean],
    [activityKeys, lastReadActivityKey]
  );

  const markAllAsAcknowledged = useCallback((): void => {
    const { current: activityKeys } = activityKeysRef;

    setRawLastAcknowledgedActivityKey(activityKeys[activityKeys.length - 1]);
  }, [activityKeysRef, setRawLastAcknowledgedActivityKey]);

  const markAsRead = useCallback(
    (activityKey: string): void => {
      setLastReadActivityKey(prevActivityKey => {
        const { current: activityKeys } = activityKeysRef;

        return activityKeys.indexOf(activityKey) > activityKeys.indexOf(prevActivityKey)
          ? activityKey
          : prevActivityKey;
      });
    },
    [activityKeysRef, setLastReadActivityKey]
  );

  const contextValue = useMemo(
    () => ({
      activityAcknowledgementsState,
      hasUnreadState,
      lastAcknowledgedActivityKeyState: Object.freeze([lastAcknowledgedActivityKey]) as readonly [string],
      lastReadActivityKeyState: Object.freeze([lastReadActivityKey]) as readonly [string],
      markAllAsAcknowledged,
      markAsRead
    }),
    [
      activityAcknowledgementsState,
      hasUnreadState,
      lastAcknowledgedActivityKey,
      lastReadActivityKey,
      markAllAsAcknowledged,
      markAsRead
    ]
  );

  return (
    <ActivityAcknowledgementContext.Provider value={contextValue}>{children}</ActivityAcknowledgementContext.Provider>
  );
};

export default ActivityAcknowledgementComposer;
