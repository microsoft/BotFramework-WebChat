import deleteSortedMessage from './graph/deleteSortedMessage';
import editState from './graph/editState';
import type { LocalId } from './property/LocalId';
import type { State } from './types';

/**
 * Removes an activity from the graph of the state, then derives the next state. Groupings and livestream sessions are
 * updated in place, nothing is re-sorted.
 */
export default function deleteActivityByLocalId(state: State, localId: LocalId): State {
  if (!state.activityMap.has(localId)) {
    throw new Error(`botframework-webchat: Cannot find activity with local ID "${localId}" to delete`);
  }

  return editState(state, working => {
    deleteSortedMessage(working, localId);

    return true;
  });
}
