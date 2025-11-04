import type { WebChatActivity } from 'botframework-webchat-core';

import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import { useSelector } from './internal/WebChatReduxContext';

export default function useActivities(mode: 'graph' | 'redux' = 'graph'): readonly [readonly WebChatActivity[]] {
  const activitiesFromGraph = useOrderedActivities();
  const activitiesFromRedux = useSelector(({ activities }) => activities);

  return mode === 'redux' ? [activitiesFromRedux] : activitiesFromGraph;

  // return useOrderedActivities();
  // return Object.freeze([useSelector(({ activities }) => activities)]);
}
