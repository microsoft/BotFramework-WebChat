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

  // Maps are intentionally mutable so the incremental fast path can append to them in-place.
  const activityIdToKeyMapRef = useRef<ActivityIdToKeyMap>(new Map());
  const activityToKeyMapRef = useRef<ActivityToKeyMap>(new Map());
  const clientActivityIdToKeyMapRef = useRef<ClientActivityIdToKeyMap>(new Map());
  const keyToActivitiesMapRef = useRef<KeyToActivitiesMap>(new Map());
  const prevActivitiesRef = useRef<readonly WebChatActivity[]>(Object.freeze([]));
  const prevActivityKeysStateRef = useRef<readonly [readonly string[]]>(
    Object.freeze([Object.freeze([])]) as readonly [readonly string[]]
  );

  // Incremental keying: the fast path only processes newly-appended activities (O(delta) per render)
  // instead of re-iterating all activities (O(n) per render, O(n²) total for n streaming pushes).
  const activityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const prevActivities = prevActivitiesRef.current;

    // Detect how many leading activities are identical (same reference) to the previous render.
    let commonPrefixLength = 0;
    const maxPrefix = Math.min(prevActivities.length, activities.length);

    // eslint-disable-next-line security/detect-object-injection
    while (commonPrefixLength < maxPrefix && prevActivities[commonPrefixLength] === activities[commonPrefixLength]) {
      commonPrefixLength++;
    }

    const isAppendOnly = commonPrefixLength === prevActivities.length;

    if (isAppendOnly) {
      // Fast path: only new activities were appended — process them incrementally.
      if (commonPrefixLength === activities.length) {
        // Array reference changed but content is identical.
        prevActivitiesRef.current = activities;

        return prevActivityKeysStateRef.current;
      }

      const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
      const { current: activityToKeyMap } = activityToKeyMapRef;
      const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
      const { current: keyToActivitiesMap } = keyToActivitiesMapRef;

      const newKeys: string[] = [];

      for (let i = commonPrefixLength; i < activities.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const activity = activities[i];
        const activityId = getActivityId(activity);
        const clientActivityId = getClientActivityId(activity);
        const typingActivityId = getActivityLivestreamingMetadata(activity)?.sessionId;

        // Since we mutate maps in-place, a single lookup covers both "previous" and
        // "current-iteration" entries — equivalent to the slow path's dual-map check.
        const key =
          (clientActivityId && clientActivityIdToKeyMap.get(clientActivityId)) ||
          (typingActivityId && activityIdToKeyMap.get(typingActivityId)) ||
          (activityId && activityIdToKeyMap.get(activityId)) ||
          activityToKeyMap.get(activity) ||
          uniqueId();

        activityId && activityIdToKeyMap.set(activityId, key);
        typingActivityId && activityIdToKeyMap.set(typingActivityId, key);
        clientActivityId && clientActivityIdToKeyMap.set(clientActivityId, key);
        activityToKeyMap.set(activity, key);

        const activitiesForKey = keyToActivitiesMap.get(key);

        keyToActivitiesMap.set(
          key,
          activitiesForKey ? Object.freeze([...activitiesForKey, activity]) : Object.freeze([activity])
        );

        !activitiesForKey && newKeys.push(key);
      }

      prevActivitiesRef.current = activities;

      if (!newKeys.length) {
        return prevActivityKeysStateRef.current;
      }

      const nextKeys = Object.freeze([...prevActivityKeysStateRef.current[0], ...newKeys]);
      const result = Object.freeze([nextKeys]) as readonly [readonly string[]];

      prevActivityKeysStateRef.current = result;

      return result;
    }

    // Slow path: activities were removed or reordered — full recalculation.
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

      const activitiesForKey = nextKeyToActivitiesMap.has(key) ? [...nextKeyToActivitiesMap.get(key)] : [];

      activitiesForKey.push(activity);
      nextKeyToActivitiesMap.set(key, Object.freeze(activitiesForKey));
    });

    activityIdToKeyMapRef.current = nextActivityIdToKeyMap;
    activityToKeyMapRef.current = nextActivityToKeyMap;
    clientActivityIdToKeyMapRef.current = nextClientActivityIdToKeyMap;
    keyToActivitiesMapRef.current = nextKeyToActivitiesMap;
    prevActivitiesRef.current = activities;

    const nextKeys = Object.freeze([...nextActivityKeys.values()]);
    const result = Object.freeze([nextKeys]) as readonly [readonly string[]];

    prevActivityKeysStateRef.current = result;

    return result;
  }, [
    activities,
    activityIdToKeyMapRef,
    activityToKeyMapRef,
    clientActivityIdToKeyMapRef,
    keyToActivitiesMapRef,
    prevActivitiesRef,
    prevActivityKeysStateRef
  ]);

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
