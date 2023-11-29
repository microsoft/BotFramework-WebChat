import { type WebChatActivity } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { type FC, type PropsWithChildren, useCallback, useMemo } from 'react';

import { type ActivityKey } from '../../../../types/ActivityKey';
import { type ActivityKeyerContextType } from './private/Context';
import ActivityKeyerContext from './private/Context';
import useAllActivities from '../AllActivities/useAllActivities';
import useKeyer from './private/useKeyer';

/**
 * React context composer component to assign a perma-key to every activity.
 * This will support `useGetActivityByKey`, `useGetActivitiesByKey` and `useGetKeyByActivity` custom hooks.
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
const ActivityKeyerComposer: FC<PropsWithChildren<{}>> = ({ children }) => {
  // ASSUMPTION: "activities" array is pre-sorted in chronological order.
  const [activities] = useAllActivities();

  const { activityIdToKeyMap, activityKeySet, activityToKeyMap, keyToActivitiesMap } = useKeyer(activities);

  const activityKeysState = useMemo(() => Object.freeze([Array.from(activityKeySet)] as const), [activityKeySet]);

  const getActivitiesByKey: (key?: ActivityKey) => readonly WebChatActivity[] = useCallback(
    (key?: ActivityKey): readonly WebChatActivity[] => (key && keyToActivitiesMap.get(key)) || [],
    [keyToActivitiesMap]
  );

  const getKeyByActivity: (activity?: WebChatActivity) => ActivityKey | undefined = useCallback(
    (activity?: WebChatActivity): ActivityKey | undefined => (activity ? activityToKeyMap.get(activity) : undefined),
    [activityToKeyMap]
  );

  const getKeyByActivityId: (activityId?: string) => ActivityKey | undefined = useCallback(
    (activityId?: string): ActivityKey | undefined => (activityId ? activityIdToKeyMap.get(activityId) : undefined),
    [activityIdToKeyMap]
  );

  const contextValue = useMemo<ActivityKeyerContextType>(
    () => ({
      activityKeysState,
      getActivitiesByKey,
      getKeyByActivity,
      getKeyByActivityId
    }),
    [activityKeysState, getActivitiesByKey, getKeyByActivity, getKeyByActivityId]
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
