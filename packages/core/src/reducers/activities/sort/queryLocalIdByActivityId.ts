import type { LocalId } from './property/LocalId';
import type { State } from './types';

export default function queryLocalIdAByActivityId(state: State, activityId: string): LocalId | undefined {
  return state.activityIdToLocalIdMap.get(activityId);
}
