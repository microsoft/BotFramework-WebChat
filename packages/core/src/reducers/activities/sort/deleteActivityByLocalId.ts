import deleteSortedMessage from './graph/deleteSortedMessage';
import deriveState from './graph/deriveState';
import type { LocalId } from './property/LocalId';
import type { State } from './types';

/**
 * Removes an activity from the graph of the state, then derives the next state. Groupings and livestream sessions are
 * updated in place, nothing is re-sorted.
 */
export default function deleteActivityByLocalId(state: State, localId: LocalId): State {
  const { graph } = state;

  if (!graph || !state.activityMap.has(localId)) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${localId}" to delete`);
  }

  graph.edit(transaction => deleteSortedMessage(transaction, localId));

  return deriveState(graph);
}
