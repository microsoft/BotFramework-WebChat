import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import reduceIterable from '../../hooks/private/reduceIterable';
import useActivities from '../../hooks/useActivities';
import usePonyfill from '../Ponyfill/usePonyfill';
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

/** After this many ms of no activity changes, verify that the frozen portion was not modified. */
const FROZEN_CHECK_TIMEOUT = 10_000;

/** Only the last N activities are compared reference-by-reference on each render. */
const MUTABLE_ACTIVITY_WINDOW = 1_000;

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
  const [{ cancelIdleCallback, clearTimeout, requestIdleCallback, setTimeout }] = usePonyfill();
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
  const pendingFrozenCheckRef = useRef<
    | {
        readonly current: readonly WebChatActivity[];
        readonly frozenBoundary: number;
        readonly prev: readonly WebChatActivity[];
      }
    | undefined
  >();
  const warnedPositionsRef = useRef<Set<number>>(new Set());

  // Incremental keying: the fast path only processes newly-appended activities (O(delta) per render)
  // instead of re-iterating all activities (O(n) per render, O(n²) total for n streaming pushes).
  const activityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const prevActivities = prevActivitiesRef.current;

    // Only the last MUTABLE_ACTIVITY_WINDOW activities are compared each render.
    // Activities before the frozen boundary are assumed unchanged — O(1) instead of O(n).
    const frozenBoundary = Math.max(0, Math.min(prevActivities.length, activities.length) - MUTABLE_ACTIVITY_WINDOW);
    let commonPrefixLength = frozenBoundary;
    const maxPrefix = Math.min(prevActivities.length, activities.length);

    // eslint-disable-next-line security/detect-object-injection
    while (commonPrefixLength < maxPrefix && prevActivities[commonPrefixLength] === activities[commonPrefixLength]) {
      commonPrefixLength++;
    }

    // Schedule deferred verification of the frozen portion if any was skipped.
    pendingFrozenCheckRef.current = frozenBoundary
      ? Object.freeze({ current: activities, frozenBoundary, prev: prevActivities })
      : undefined;

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

    // Slow path did a full recalculation — no frozen check needed, reset warnings.
    pendingFrozenCheckRef.current = undefined;
    warnedPositionsRef.current.clear();

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
    pendingFrozenCheckRef,
    prevActivitiesRef,
    prevActivityKeysStateRef,
    warnedPositionsRef
  ]);

  // Deferred verification: after FROZEN_CHECK_TIMEOUT of quiet, validate that activities
  // inside the frozen portion have not actually changed. Warn once per position if they did.
  // Uses requestIdleCallback inside the timeout to avoid contending with the first post-stream repaint.
  useEffect(() => {
    const pending = pendingFrozenCheckRef.current;

    if (!pending) {
      return;
    }

    let idleHandle: ReturnType<NonNullable<typeof requestIdleCallback>> | undefined;

    const runCheck = () => {
      const { current: currentActivities, frozenBoundary, prev: prevFrozenActivities } = pending;

      for (let i = 0; i < frozenBoundary; i++) {
        // eslint-disable-next-line security/detect-object-injection
        if (prevFrozenActivities[i] !== currentActivities[i] && !warnedPositionsRef.current.has(i)) {
          warnedPositionsRef.current.add(i);

          console.warn(
            `botframework-webchat internal: change in activity at position ${i} was not applied because it is outside the mutable window of ${MUTABLE_ACTIVITY_WINDOW}.`
          );
        }
      }
    };

    const timer = setTimeout(() => {
      if (requestIdleCallback) {
        idleHandle = requestIdleCallback(runCheck);
      } else {
        runCheck();
      }
    }, FROZEN_CHECK_TIMEOUT);

    return () => {
      clearTimeout(timer);
      idleHandle !== undefined && cancelIdleCallback?.(idleHandle);
    };
  }, [activities, cancelIdleCallback, clearTimeout, requestIdleCallback, setTimeout]);

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
