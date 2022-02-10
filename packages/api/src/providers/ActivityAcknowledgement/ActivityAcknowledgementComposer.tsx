import React, { useCallback, useMemo, useState } from 'react';

import type { FC, PropsWithChildren } from 'react';

import ActivityAcknowledgementContext, { ActivityAcknowledgementContextType } from './private/Context';
import findLastIndex from '../../utils/findLastIndex';
import useActivities from '../../hooks/useActivities';
import useActivityKeys from '../ActivityKeyer/useActivityKeys';
import usePrevious from '../../hooks/internal/usePrevious';
import useValueRef from '../../hooks/internal/useValueRef';

import type { ActivityAcknowledgement } from './private/types';

type ActivityAcknowledgementComposerProps = PropsWithChildren<{}>;

function findClosestActivityKeyIfNotExists(
  activityKey: string,
  keys: readonly string[],
  prevKeys: readonly string[]
): string | undefined {
  if (keys.includes(activityKey)) {
    return activityKey;
  } else if (!prevKeys || !activityKey) {
    // Initially, when the transcript was empty, there should be nothing read.
    return;
  }

  // If the last activity key is no longer in this activities (say, deleted), we try to find the closest one.
  const prevIndex = prevKeys.indexOf(activityKey);

  if (~prevIndex) {
    // List out all previously activity keys, find the closest one that is in the new transcript.
    const acknowledgedActivityKeys = prevKeys.slice(0, prevIndex).reverse();

    for (const prevAcknowledgedActivityKey of acknowledgedActivityKeys) {
      if (keys.includes(prevAcknowledgedActivityKey)) {
        return prevAcknowledgedActivityKey;
      }
    }
  }

  // If nothing is found, return `undefined`.
}

const ActivityAcknowledgementComposer: FC<ActivityAcknowledgementComposerProps> = ({ children }) => {
  const [activities] = useActivities();
  const [allActivityKeys] = useActivityKeys();
  const [rawLastAcknowledgedActivityKey, setRawLastAcknowledgedActivityKey] = useState<string | undefined>();
  const [rawLastReadActivityKey, setRawLastReadActivityKey] = useState<string | undefined>();

  const allActivityKeysRef = useValueRef(allActivityKeys);
  const prevAllActivityKeys = usePrevious(allActivityKeys);

  const lastOutgoingActivityKeyIndex = useMemo(
    () => findLastIndex(activities, activity => activity.from?.role === 'user'),
    [activities]
  );

  // Make sure when we return "lastReadActivityKey" exists in the current transcript.
  const lastReadActivityKey = useMemo(() => {
    rawLastReadActivityKey &&
      !~prevAllActivityKeys.includes(rawLastReadActivityKey) &&
      console.warn(
        `botframework-webchat internal assertion: "rawLastReadActivityKey" of value ${rawLastReadActivityKey} should be in the "prevAllActivityKeys" array.`
      );

    return findClosestActivityKeyIfNotExists(rawLastReadActivityKey, allActivityKeys, prevAllActivityKeys);
  }, [allActivityKeys, prevAllActivityKeys, rawLastReadActivityKey]);

  const lastReadActivityKeyRef = useValueRef(lastReadActivityKey);

  // Make sure when we return "lastAcknowledgedActivityKey" exists in the current transcript.
  const lastAcknowledgedActivityKey = useMemo(() => {
    rawLastAcknowledgedActivityKey &&
      !~prevAllActivityKeys.includes(rawLastAcknowledgedActivityKey) &&
      console.warn(
        `botframework-webchat internal assertion: "rawLastAcknowledgedActivityKey" of value ${rawLastAcknowledgedActivityKey} should be in the "prevAllActivityKeys" array.`
      );

    const lastAcknowledgedActivityKey = findClosestActivityKeyIfNotExists(
      rawLastAcknowledgedActivityKey,
      allActivityKeys,
      prevAllActivityKeys
    );

    // TODO: [P2] Since Direct Line may send history and does not have read receipt.
    //            Thus, if we don't assume everything is acknowledged initially, while displaying the history,
    //            the transcript would soon stop scrolling.
    //            Thus, before the first outgoing activity is detected, we need to assume everything is acknowledged.
    return (
      allActivityKeys[Math.max(allActivityKeys.indexOf(lastAcknowledgedActivityKey), lastOutgoingActivityKeyIndex)] ||
      allActivityKeys[allActivityKeys.length - 1]
    );
  }, [allActivityKeys, lastOutgoingActivityKeyIndex, prevAllActivityKeys, rawLastAcknowledgedActivityKey]);

  const activityAcknowledgements = useMemo<Readonly<Map<string, ActivityAcknowledgement>>>(() => {
    const activityAcknowledgements = new Map<string, ActivityAcknowledgement>();
    const lastAcknowledgedIndex = allActivityKeys.indexOf(lastAcknowledgedActivityKey);
    const lastReadIndex = allActivityKeys.indexOf(lastReadActivityKey);

    allActivityKeys.forEach((activityKey, index) => {
      activityAcknowledgements.set(activityKey, {
        acknowledged: index <= lastAcknowledgedIndex,
        read: index <= lastReadIndex
      });
    });

    return Object.freeze(activityAcknowledgements);
  }, [allActivityKeys, lastAcknowledgedActivityKey, lastReadActivityKey]);

  const activityAcknowledgementsRef = useValueRef(activityAcknowledgements);

  const getHasAcknowledgedByActivityKey = useCallback<(activityKey: string) => boolean>(
    (activityKey: string) => activityAcknowledgementsRef.current.get(activityKey)?.acknowledged,
    [activityAcknowledgementsRef]
  );

  // TODO: [P2] Memoize with `useMemoWithPrevious` for better memoization of arrays.
  const activityKeysByReadState = useMemo<readonly [readonly string[], readonly string[]]>(() => {
    const index = allActivityKeys.indexOf(lastReadActivityKey);

    return Object.freeze([
      Object.freeze(allActivityKeys.slice(0, index + 1)),
      Object.freeze(allActivityKeys.slice(index + 1))
    ]) as readonly [readonly string[], readonly string[]];
  }, [allActivityKeys, lastReadActivityKey]);

  const markAllAsAcknowledged = useCallback((): void => {
    const { current: allActivityKeys } = allActivityKeysRef;

    setRawLastAcknowledgedActivityKey(allActivityKeys[allActivityKeys.length - 1]);
  }, [allActivityKeysRef, setRawLastAcknowledgedActivityKey]);

  const markActivityKeyAsRead = useCallback(
    (activityKey: string): void => {
      const { current: allActivityKeys } = allActivityKeysRef;
      const index = allActivityKeys.indexOf(activityKey);

      if (!~index) {
        return console.warn(
          `botframework-webchat: Cannot mark activity with key ${activityKey} as read because it is not in the transcript.`
        );
      }

      index > allActivityKeys.indexOf(lastReadActivityKeyRef.current) && setRawLastReadActivityKey(activityKey);
    },
    [allActivityKeysRef, lastReadActivityKeyRef, setRawLastReadActivityKey]
  );

  if (activityKeysByReadState[0].length + activityKeysByReadState[1].length !== allActivityKeys.length) {
    console.warn(
      'botframework-webchat internal: Sum of count of read and unread activity keys MUST equals to total number of activity keys.'
    );
  }

  const contextValue = useMemo<ActivityAcknowledgementContextType>(
    () => ({
      activityKeysByReadState,
      getHasAcknowledgedByActivityKey,
      lastAcknowledgedActivityKeyState: Object.freeze([lastAcknowledgedActivityKey]) as readonly [string],
      lastReadActivityKeyState: Object.freeze([lastReadActivityKey]) as readonly [string],
      markActivityKeyAsRead,
      markAllAsAcknowledged
    }),
    [
      activityKeysByReadState,
      getHasAcknowledgedByActivityKey,
      lastAcknowledgedActivityKey,
      lastReadActivityKey,
      markActivityKeyAsRead,
      markAllAsAcknowledged
    ]
  );

  return (
    <ActivityAcknowledgementContext.Provider value={contextValue}>{children}</ActivityAcknowledgementContext.Provider>
  );
};

export default ActivityAcknowledgementComposer;
