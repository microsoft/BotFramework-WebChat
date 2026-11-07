import type { State } from '../types';
import createActivitiesGraph from './createActivitiesGraph';
import deriveState from './deriveState';
import WorkingGraph, { type FlushResult } from './private/WorkingGraph';

/**
 * Runs one store transaction for a `State`, then derives the next `State`.
 *
 * - **Stale state** (an older state reduced again, e.g. replay or time travel): the store has committed since this
 *   state was derived, so a new graph is built from this state's snapshot (snapshots are immutable), then edited.
 * - **Failure**: the store commits all writes of a transaction or none, so a failed action leaves the graph and the
 *   state from before it as they were.
 *
 * @param editor Edits the graph. Returns `false` if nothing changed.
 */
export default function editState(state: State, editor: (working: WorkingGraph) => boolean): State {
  const graph =
    state.graph && state.graph.store.getSnapshot() === state.graphSnapshot
      ? state.graph
      : createActivitiesGraph(state.graphSnapshot?.values());

  let result: FlushResult | undefined;

  graph.edit(transaction => {
    const working = new WorkingGraph(
      transaction,
      graph.store.getSnapshot(),
      state.graphPartIndex,
      state.graphActivities
    );

    if (editor(working)) {
      result = working.flush();
    }
  });

  if (!result) {
    // Nothing changed. The graph may have been rebuilt from this state.
    return graph === state.graph ? state : Object.freeze({ ...state, graph, graphSnapshot: graph.store.getSnapshot() });
  }

  return deriveState(graph, state, result);
}
