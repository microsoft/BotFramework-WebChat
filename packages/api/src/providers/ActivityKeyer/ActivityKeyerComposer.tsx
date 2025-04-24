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
// eslint-disable-next-line complexity
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
  const lastProcessedIndexRef = useRef(0);

  // Process new activities (if any)
  if (activities.length > lastProcessedIndexRef.current) {
    for (let i = lastProcessedIndexRef.current; i < activities.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const activity = activities[i];
      const activityId = getActivityId(activity);
      if (!activityId) {
        break;
      }
      const clientActivityId = getClientActivityId(activity);
      const typingActivityId = getActivityLivestreamingMetadata(activity)?.sessionId;

      const key =
        (clientActivityId && clientActivityIdToKeyMapRef.current.get(clientActivityId)) ||
        (typingActivityId && activityIdToKeyMapRef.current.get(typingActivityId)) ||
        (activityId && activityIdToKeyMapRef.current.get(activityId)) ||
        activityToKeyMapRef.current.get(activity) ||
        uniqueId();

      activityId && activityIdToKeyMapRef.current.set(activityId, key);
      clientActivityId && clientActivityIdToKeyMapRef.current.set(clientActivityId, key);

      activityToKeyMapRef.current.set(activity, key);
      const existingList = keyToActivitiesMapRef.current.get(key) ?? [];
      keyToActivitiesMapRef.current.set(key, Object.freeze([...existingList, activity]));
      lastProcessedIndexRef.current = activities.length;
    }
  }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activityKeys = useMemo(() => Object.freeze([...keyToActivitiesMapRef.current.keys()]), [activities.length]); // we want to update the keys when activities change

  const contextValue = useMemo<ActivityKeyerContextType>(
    () => ({
      activityKeysState: [activityKeys],
      getActivityByKey,
      getActivitiesByKey,
      getKeyByActivity,
      getKeyByActivityId
    }),
    [activityKeys, getActivitiesByKey, getActivityByKey, getKeyByActivity, getKeyByActivityId]
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

  if (activityKeys.length !== keyToActivitiesMapRef.current.size) {
    console.warn(
      'botframework-webchat internal assertion: "activityKeys.length" should be same as "keyToActivitiesMap.size".'
    );
  }

  return <ActivityKeyerContext.Provider value={contextValue}>{children}</ActivityKeyerContext.Provider>;
};

export default ActivityKeyerComposer;
