import type { LocalId } from './property/LocalId';
import type { State } from './types';

export default function queryLocalIdAByClientActivityId(state: State, clientActivityId: string): LocalId | undefined {
  return state.clientActivityIdToLocalIdMap.get(clientActivityId);
}
