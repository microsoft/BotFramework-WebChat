import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import { hooks } from 'botframework-webchat-api';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC } from 'react';

import ActivityKeyerContext from './private/Context';
import getActivityId from './private/getActivityId';
import getClientActivityId from './private/getClientActivityId';
import uniqueId from './private/uniqueId';

type ActivityIdToKeyMap = Map<string, string>;
type ActivityToKeyMap = Map<DirectLineActivity, string>;
type ClientActivityIdToKeyMap = Map<string, string>;
type KeyToActivityMap = Map<string, DirectLineActivity>;

const { useActivities } = hooks;

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
// TODO: [P*] Add telemetry to see how many new keys are generated.
const ActivityKeyerComposer: FC<{}> = ({ children }) => {
  const [activities] = useActivities();
  const activityToKeyMapRef = useRef<ActivityToKeyMap>(new Map());
  const activityIdToKeyMapRef = useRef<ActivityIdToKeyMap>(new Map());
  const clientActivityIdToKeyMapRef = useRef<ClientActivityIdToKeyMap>(new Map());
  const keyToActivityMapRef = useRef<KeyToActivityMap>(new Map());

  useMemo(() => {
    const { current: activityIdToKeyMap } = activityIdToKeyMapRef;
    const { current: activityToKeyMap } = activityToKeyMapRef;
    const { current: clientActivityIdToKeyMap } = clientActivityIdToKeyMapRef;
    const nextActivityIdToKeyMap: ActivityIdToKeyMap = new Map();
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
    });

    activityIdToKeyMapRef.current = nextActivityIdToKeyMap;
    activityToKeyMapRef.current = nextActivityToKeyMap;
    clientActivityIdToKeyMapRef.current = nextClientActivityIdToKeyMap;
    keyToActivityMapRef.current = nextKeyToActivityMap;
  }, [activities, activityIdToKeyMapRef, activityToKeyMapRef, clientActivityIdToKeyMapRef, keyToActivityMapRef]);

  const getActivityByKey: (key?: string) => DirectLineActivity | undefined = useCallback(
    (key?: string): DirectLineActivity | undefined => key && keyToActivityMapRef.current.get(key),
    [keyToActivityMapRef]
  );

  const getKeyByActivity: (activity?: DirectLineActivity) => string | undefined = useCallback(
    (activity?: DirectLineActivity) => activity && activityToKeyMapRef.current.get(activity),
    [activityToKeyMapRef]
  );

  const contextValue = useMemo(
    () => ({
      getActivityByKey,
      getKeyByActivity
    }),
    [getActivityByKey, getKeyByActivity]
  );

  return <ActivityKeyerContext.Provider value={contextValue}>{children}</ActivityKeyerContext.Provider>;
};

ActivityKeyerComposer.defaultProps = {
  children: undefined
};

ActivityKeyerComposer.propTypes = {
  children: PropTypes.any
};

export default ActivityKeyerComposer;
