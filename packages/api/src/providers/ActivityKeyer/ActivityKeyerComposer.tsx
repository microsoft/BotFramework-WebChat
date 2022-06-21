import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';
import type { FC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import ActivityKeyerContext, { ActivityKeyerContextType } from './private/Context';
import getActivityId from './private/getActivityId';
import getClientActivityId from './private/getClientActivityId';
import uniqueId from './private/uniqueId';
import useActivities from '../../hooks/useActivities';
import useActivityKeyerContext from './private/useContext';

type ActivityIdToKeyMap = Map<string, string>;
type ActivityToKeyMap = Map<WebChatActivity, string>;
type ClientActivityIdToKeyMap = Map<string, string>;
type KeyToActivityMap = Map<string, WebChatActivity>;

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
const ActivityKeyerComposer: FC<{}> = ({ children }) => {
  const existingContext = useActivityKeyerContext(false);

  if (existingContext) {
    throw new Error('botframework-webchat internal: <ActivityKeyerComposer> should not be nested.');
  }

  const [activities] = useActivities();
  const activityIdToKeyMapRef = useRef<Readonly<ActivityIdToKeyMap>>(Object.freeze(new Map()));
  const activityToKeyMapRef = useRef<Readonly<ActivityToKeyMap>>(Object.freeze(new Map()));
  const clientActivityIdToKeyMapRef = useRef<Readonly<ClientActivityIdToKeyMap>>(Object.freeze(new Map()));
  const keyToActivityMapRef = useRef<Readonly<KeyToActivityMap>>(Object.freeze(new Map()));

  // TODO: [P1] `useMemoWithPrevious` to check and cache the resulting array if it hasn't changed.
  const activityKeysState = useMemo<readonly [readonly string[]]>(() => {
    const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
    const { current: activityToKeyMap } = activityToKeyMapRef;
    const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
    const nextActivityIdToKeyMap: ActivityIdToKeyMap = new Map();
    const nextActivityKeys: string[] = [];
    const nextActivityToKeyMap: ActivityToKeyMap = new Map();
    const nextClientActivityIdToKeyMap: ClientActivityIdToKeyMap = new Map();
    const nextKeyToActivityMap: KeyToActivityMap = new Map();

    activities.forEach(activity => {
      const activityId = getActivityId(activity);
      const clientActivityId = getClientActivityId(activity);

      const key =
        (clientActivityId && clientActivityIdToKeyMap.get(clientActivityId)) ||
        (activityId && activityIdToKeyMap.get(activityId)) ||
        activityToKeyMap.get(activity) ||
        uniqueId();

      activityId && nextActivityIdToKeyMap.set(activityId, key);
      clientActivityId && nextClientActivityIdToKeyMap.set(clientActivityId, key);
      nextActivityToKeyMap.set(activity, key);
      nextKeyToActivityMap.set(key, activity);
      nextActivityKeys.push(key);
    });

    activityIdToKeyMapRef.current = Object.freeze(nextActivityIdToKeyMap);
    activityToKeyMapRef.current = Object.freeze(nextActivityToKeyMap);
    clientActivityIdToKeyMapRef.current = Object.freeze(nextClientActivityIdToKeyMap);
    keyToActivityMapRef.current = Object.freeze(nextKeyToActivityMap);

    // `nextActivityKeys` could potentially same as `prevActivityKeys` despite reference differences, we should memoize it.
    return Object.freeze([Object.freeze(nextActivityKeys)]) as readonly [readonly string[]];
  }, [activities, activityIdToKeyMapRef, activityToKeyMapRef, clientActivityIdToKeyMapRef, keyToActivityMapRef]);

  const getActivityByKey: (key?: string) => undefined | WebChatActivity = useCallback(
    (key?: string): undefined | WebChatActivity => key && keyToActivityMapRef.current.get(key),
    [keyToActivityMapRef]
  );

  const getKeyByActivity: (activity?: WebChatActivity) => string | undefined = useCallback(
    (activity?: WebChatActivity) => activity && activityToKeyMapRef.current.get(activity),
    [activityToKeyMapRef]
  );

  const getKeyByActivityId: (activityId?: string) => string | undefined = useCallback(
    (activityId?: string) => activityId && activityIdToKeyMapRef.current.get(activityId),
    [activityIdToKeyMapRef]
  );

  const contextValue = useMemo<ActivityKeyerContextType>(
    () => ({
      activityKeysState,
      getActivityByKey,
      getKeyByActivity,
      getKeyByActivityId
    }),
    [activityKeysState, getActivityByKey, getKeyByActivity, getKeyByActivityId]
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

  if (keyToActivityMapRef.current.size !== numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "keyToActivityMap.size" should be same as "activities.length".'
    );
  }

  if (activityKeysState[0].length !== numActivities) {
    console.warn(
      'botframework-webchat internal assertion: "activityKeys.length" should be same as "activities.length".'
    );
  }

  return <ActivityKeyerContext.Provider value={contextValue}>{children}</ActivityKeyerContext.Provider>;
};

ActivityKeyerComposer.defaultProps = {
  children: undefined
};

ActivityKeyerComposer.propTypes = {
  children: PropTypes.any
};

export default ActivityKeyerComposer;
