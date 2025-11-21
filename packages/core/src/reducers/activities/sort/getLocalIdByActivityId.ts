import type { ActivityLocalId, State } from './types';

export default function getLocalIdAByActivityId(state: State, activityId: string): ActivityLocalId | undefined {
  return state.activityIdToLocalIdMap.get(activityId);
}
