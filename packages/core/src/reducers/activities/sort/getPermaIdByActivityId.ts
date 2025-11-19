import type { ActivityInternalIdentifier, State } from './types';

// TODO: [P0] This is hot path, consider building an index.
export default function getPermaIdAByActivityId(
  state: State,
  activityId: string
): ActivityInternalIdentifier | undefined {
  for (const [permaId, entry] of state.activityMap.entries()) {
    if (entry.activity.id === activityId) {
      return permaId;
    }
  }

  return undefined;
}
