import type { ActivityLocalId, State } from './types';

// TODO: [P0] This is hot path, consider building an index.
export default function getLocalIdAByActivityId(state: State, activityId: string): ActivityLocalId | undefined {
  for (const [localId, entry] of state.activityMap.entries()) {
    if (entry.activity.id === activityId) {
      return localId;
    }
  }

  return undefined;
}
