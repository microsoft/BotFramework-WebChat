import createActivitiesGraph from '../graph/createActivitiesGraph';
import type { ActivitiesCoreState } from '../types';
import { INITIAL_STATE } from '../upsert';

/**
 * Creates an empty state with its own graph (William's store), created upfront so readers can subscribe to it before
 * the first activity.
 */
export default function createInitialState(): ActivitiesCoreState {
  return Object.freeze({ ...INITIAL_STATE, graph: createActivitiesGraph() });
}
