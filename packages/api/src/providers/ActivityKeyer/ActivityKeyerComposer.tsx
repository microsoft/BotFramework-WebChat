import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { useCallback, useMemo, useRef, type ReactNode } from 'react';

import reduceIterable from '../../hooks/private/reduceIterable';
import useActivities from '../../hooks/useActivities';
import type { ActivityKeyerContextType } from './private/Context';
import ActivityKeyerContext from './private/Context';
import getActivityId from './private/getActivityId';
import getClientActivityId from './private/getClientActivityId';
import lastOf from './private/lastOf';
import someIterable from './private/someIterable';
import uniqueId from './private/uniqueId';
import useActivityKeyerContext from './private/useContext';

type ActivityIdToKeyMap = Map<string, string>;
type ActivityToKeyMap = Map<WebChatActivity, string>;
type ClientActivityIdToKeyMap = Map<string, string>;
type KeyToActivitiesMap = Map<string, readonly WebChatActivity[]>;

/**
 * React context composer component to assign a perma-key to every activity.
 * This will support both `useGetActivityByKey` and `useGetKeyByActivity` custom hooks.
 *
 * Today, `activity.id` is only guaranteed for activity from others.
 * Not all activities sent by the local user has `activity.id`.
 *
 * To track outgoing activities, we added `activity.channelData.clientActivityId`.
 *
 * This component will create a local key, which can be used to track both
 * incoming and outgoing activities in a consistent way.
 *
 * Local key are only persisted in memory. On refresh, they will be a new random key.
 */
const ActivityKeyerComposer = ({ children }: Readonly<{ children?: ReactNode | undefined }>) => {
  const existingContext = useActivityKeyerContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityKeyerComposer> should not be nested.');
  }

  const [activities] = useActivities();
  const activityIdToKeyMapRef = useRef<Readonly<ActivityIdToKeyMap>>(Object.freeze(new Map()));
  const activityToKeyMapRef = useRef<Readonly<ActivityToKeyMap>>(Object.freeze(new Map()));
  const clientActivityIdToKeyMapRef = useRef<Readonly<ClientActivityIdToKeyMap>>(Object.freeze(new Map()));
  const keyToActivitiesMapRef = useRef<Readonly<KeyToActivitiesMap>>(Object.freeze(new Map()));

  // TODO: [P1] `useMemoWithPrevious` to check and cache the resulting array if it hasn't changed.
  const activityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
    const { current: activityToKeyMap } = activityToKeyMapRef;
    const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
    const nextActivityIdToKeyMap: ActivityIdToKeyMap = new Map();
    const nextActivityKeys: Set<string> = new Set();
    const nextActivityToKeyMap: ActivityToKeyMap = new Map();
    const nextClientActivityIdToKeyMap: ClientActivityIdToKeyMap = new Map();
    const nextKeyToActivitiesMap: KeyToActivitiesMap = new Map();

    activities.forEach(activity => {
      const activityId = getActivityId(activity);
      const clientActivityId = getClientActivityId(activity);
      const typingActivityId = getActivityLivestreamingMetadata(activity)?.sessionId;

      const key =
        (clientActivityId &&
          (clientActivityIdToKeyMap.get(clientActivityId) || nextClientActivityIdToKeyMap.get(clientActivityId))) ||
        (typingActivityId &&
          (activityIdToKeyMap.get(typingActivityId) || nextActivityIdToKeyMap.get(typingActivityId))) ||
        (activityId && (activityIdToKeyMap.get(activityId) || nextActivityIdToKeyMap.get(activityId))) ||
        activityToKeyMap.get(activity) ||
        nextActivityToKeyMap.get(activity) ||
        uniqueId();

      activityId && nextActivityIdToKeyMap.set(activityId, key);
      typingActivityId && nextActivityIdToKeyMap.set(typingActivityId, key);
      clientActivityId && nextClientActivityIdToKeyMap.set(clientActivityId, key);
      nextActivityToKeyMap.set(activity, key);
      nextActivityKeys.add(key);

      const activities = nextKeyToActivitiesMap.has(key) ? [...nextKeyToActivitiesMap.get(key)] : [];

      activities.push(activity);
      nextKeyToActivitiesMap.set(key, Object.freeze(activities));
    });

    activityIdToKeyMapRef.current = Object.freeze(nextActivityIdToKeyMap);
    activityToKeyMapRef.current = Object.freeze(nextActivityToKeyMap);
    clientActivityIdToKeyMapRef.current = Object.freeze(nextClientActivityIdToKeyMap);
    keyToActivitiesMapRef.current = Object.freeze(nextKeyToActivitiesMap);

    // `nextActivityKeys` could potentially same as `prevActivityKeys` despite reference differences, we should memoize it.
    return Object.freeze([Object.freeze([...nextActivityKeys.values()])]) as readonly [readonly string[]];
  }, [activities, activityIdToKeyMapRef, activityToKeyMapRef, clientActivityIdToKeyMapRef, keyToActivitiesMapRef]);

  const getActivitiesByKey: (key?: string | undefined) => readonly WebChatActivity[] | undefined = useCallback(
    (key?: string | undefined): readonly WebChatActivity[] | undefined => key && keyToActivitiesMapRef.current.get(key),
    [keyToActivitiesMapRef]
  );

  const getActivityByKey: (key?: string | undefined) => undefined | WebChatActivity = useCallback(
    (key?: string | undefined): undefined | WebChatActivity => lastOf(getActivitiesByKey(key)),
    [getActivitiesByKey]
  );

  const getKeyByActivity: (activity?: WebChatActivity | undefined) => string | undefined = useCallback(
    (activity?: WebChatActivity | undefined) => activity && activityToKeyMapRef.current.get(activity),
    [activityToKeyMapRef]
  );

  const getKeyByActivityId: (activityId?: string | undefined) => string | undefined = useCallback(
    (activityId?: string | undefined) => activityId && activityIdToKeyMapRef.current.get(activityId),
    [activityIdToKeyMapRef]
  );

  const contextValue = useMemo<ActivityKeyerContextType>(
    () => ({ activityKeysState, getActivityByKey, getActivitiesByKey, getKeyByActivity, getKeyByActivityId }),
    [activityKeysState, getActivitiesByKey, getActivityByKey, getKeyByActivity, getKeyByActivityId]
  );

  const { length: numActivities } = activities;

  if (activityIdToKeyMapRef.current.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityIdToKeyMap.size" should be equal or less than "activities.length".'
    );
  }

  if (activityToKeyMapRef.current.size !== numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityToKeyMap.size" should be same as "activities.length".'
    );
  }

  if (clientActivityIdToKeyMapRef.current.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "clientActivityIdToKeyMap.size" should be equal or less than "activities.length".'
    );
  }

  if (someIterable(keyToActivitiesMapRef.current.values(), ({ length }) => !length)) {
    console.warn(
      'botframework-webchat internal assertion: all values in "keyToActivitiesMap" should have at least one item.'
    );
  }

  if (
    reduceIterable(keyToActivitiesMapRef.current.values(), (total, { length }) => total + length, 0) !== numActivities
  ) {
    console.warn(
      'botframework-webchat internal assertion: "keyToActivitiesMap.size" should be same as "activities.length".'
    );
  }

  if (activityKeysState[0].length !== keyToActivitiesMapRef.current.size) {
    console.warn(
      'botframework-webchat internal assertion: "activityKeys.length" should be same as "keyToActivitiesMap.size".'
    );
  }

  return <ActivityKeyerContext.Provider value={contextValue}>{children}</ActivityKeyerContext.Provider>;
};

export default ActivityKeyerComposer;
