import type { ActivityLocalId, State } from './types';

export default function getLocalIdAByClientActivityId(
  state: State,
  clientActivityId: string
): ActivityLocalId | undefined {
  return state.clientActivityIdToLocalIdMap.get(clientActivityId);
}
