import type { ActivityInternalIdentifier, State } from './types';

// TODO: [P0] This is hot path, consider building an index.
export default function getPermaIdAByClientActivityId(
  state: State,
  clientActivityId: string
): ActivityInternalIdentifier | undefined {
  for (const [permaId, entry] of state.activityMap.entries()) {
    if (entry.activity.channelData.clientActivityID === clientActivityId) {
      return permaId;
    }
  }

  return undefined;
}
