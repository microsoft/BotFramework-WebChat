import { useMemo, useRef } from 'react';

import getActivityId from './getActivityId';
import getClientActivityId from './getClientActivityId';
import uniqueId from './uniqueId';

import { type ActivityIdToKeyMap } from '../types/ActivityIdToKeyMap';
import { type ActivityKey } from '../../../../../types/ActivityKey';
import { type ActivityToKeyMap } from '../types/ActivityToKeyMap';
import { type ClientActivityIdToKeyMap } from '../types/ClientActivityIdToKeyMap';
import { type KeyToActivitiesMap } from '../types/KeyToActivitiesMap';
import { type WebChatActivity } from 'botframework-webchat-core';

export default function useKeyer(activities: readonly WebChatActivity[]): {
  readonly activityIdToKeyMap: Readonly<ActivityIdToKeyMap>;
  readonly activityKeySet: ReadonlySet<ActivityKey>;
  readonly activityToKeyMap: Readonly<ActivityToKeyMap>;
  readonly clientActivityIdToKeyMap: Readonly<ClientActivityIdToKeyMap>;
  readonly keyToActivitiesMap: Readonly<KeyToActivitiesMap>;
} {
  const activityIdToKeyMapRef = useRef<Readonly<ActivityIdToKeyMap>>(Object.freeze(new Map()));
  const activityKeySetRef = useRef<ReadonlySet<ActivityKey>>(Object.freeze(new Set<ActivityKey>()));
  const activityToKeyMapRef = useRef<Readonly<ActivityToKeyMap>>(Object.freeze(new Map()));
  const clientActivityIdToKeyMapRef = useRef<Readonly<ClientActivityIdToKeyMap>>(Object.freeze(new Map()));
  const keyToActivitiesMapRef = useRef<Readonly<KeyToActivitiesMap>>(Object.freeze(new Map()));

  useMemo<void>(() => {
    const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
    const { current: activityToKeyMap } = activityToKeyMapRef;
    const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
    const nextActivityIdToKeyMap: ActivityIdToKeyMap = new Map();
    const nextActivityKeys: Set<ActivityKey> = new Set();
    const nextActivityToKeyMap: ActivityToKeyMap = new Map();
    const nextClientActivityIdToKeyMap: ClientActivityIdToKeyMap = new Map();
    const nextKeyToActivitiesMap: KeyToActivitiesMap = new Map();

    // TODO: "typistIdAndReplyToIdToKeyMap" should be refreshed, i.e. prefer "nextTypistIdAndReplyToIdToKeyMap"
    const temporalFromIdAndReplyToIdToKeyMap: Map<`${string}|${string}`, ActivityKey> = new Map();

    // Think about:
    // 1. typing in reply to A (#1)
    // 2. typing in reply to A (#1)
    // 3. typing in reply to B (#2)
    // 4. typing in reply to A (#1)
    // 5. typing in reply to B (#2)
    // 6. message in reply to A (#1)
    // 7. message in reply to B (#2)
    // 8. typing in reply to A (#3) (Should be a new message even when it is replying to A)

    activities.forEach(activity => {
      const {
        from: { id: fromId },
        replyToId,
        type
      } = activity;

      const fromIdWithReplyToId = fromId && replyToId && (`${fromId}|${replyToId}` as const);

      const activityId = getActivityId(activity);
      const clientActivityId = getClientActivityId(activity);
      const keyByTyping: ActivityKey | undefined = fromIdWithReplyToId
        ? temporalFromIdAndReplyToIdToKeyMap.get(fromIdWithReplyToId)
        : undefined;

      const key: ActivityKey =
        keyByTyping ||
        (clientActivityId && clientActivityIdToKeyMap.get(clientActivityId)) ||
        (activityId && activityIdToKeyMap.get(activityId)) ||
        activityToKeyMap.get(activity) ||
        `wc.a.${uniqueId()}`;

      activityId && nextActivityIdToKeyMap.set(activityId, key);
      clientActivityId && nextClientActivityIdToKeyMap.set(clientActivityId, key);
      nextActivityToKeyMap.set(activity, key);
      nextKeyToActivitiesMap.set(key, Object.freeze([...(nextKeyToActivitiesMap.get(key) || []), activity]));

      if (fromIdWithReplyToId) {
        type === 'typing'
          ? temporalFromIdAndReplyToIdToKeyMap.set(fromIdWithReplyToId, key)
          : temporalFromIdAndReplyToIdToKeyMap.delete(fromIdWithReplyToId);
      }

      nextActivityKeys.add(key);
    });

    activityIdToKeyMapRef.current = Object.freeze(nextActivityIdToKeyMap);
    // `nextActivityKeys` could potentially same as `prevActivityKeys` despite reference differences, we should memoize it.
    activityKeySetRef.current = Object.freeze(nextActivityKeys);
    activityToKeyMapRef.current = Object.freeze(nextActivityToKeyMap);
    clientActivityIdToKeyMapRef.current = Object.freeze(nextClientActivityIdToKeyMap);
    keyToActivitiesMapRef.current = Object.freeze(nextKeyToActivitiesMap);
  }, [
    activities,
    activityIdToKeyMapRef,
    activityKeySetRef,
    activityToKeyMapRef,
    clientActivityIdToKeyMapRef,
    keyToActivitiesMapRef
  ]);

  const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
  const { current: activityKeySet } = activityKeySetRef;
  const { current: activityToKeyMap } = activityToKeyMapRef;
  const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
  const { current: keyToActivitiesMap } = keyToActivitiesMapRef;

  const { length: numActivities } = activities;

  if (activityIdToKeyMap.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityIdToKeyMap.size" should be equal or less than "activities.length".'
    );
  }

  if (activityToKeyMap.size !== numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityToKeyMap.size" should be same as "activities.length".'
    );
  }

  if (clientActivityIdToKeyMap.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "clientActivityIdToKeyMap.size" should be equal or less than "activities.length".'
    );
  }

  if (keyToActivitiesMap.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "keyToActivitiesMap.size" should be equal or less than "activities.length".'
    );
  }

  if (
    Array.from(keyToActivitiesMap.values()).reduce((numActivities, { length }) => numActivities + length, 0) !==
    numActivities
  ) {
    console.warn(
      'botframework-webchat internal assertion: "keyToActivitiesMap.values().size" should be same as "activities.length".'
    );
  }

  if (activityKeySet.size > numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityKeySet.size" should be equal or less than "activities.length".'
    );
  }

  if (activityKeySet.size !== Array.from(keyToActivitiesMap.values()).length) {
    console.warn(
      'botframework-webchat internal assertion: "activityKeySet.size" should be same as "keyToActivitiesMap.values().size".'
    );
  }

  return Object.freeze({
    activityIdToKeyMap,
    activityKeySet,
    activityToKeyMap,
    clientActivityIdToKeyMap,
    keyToActivitiesMap
  });
}
