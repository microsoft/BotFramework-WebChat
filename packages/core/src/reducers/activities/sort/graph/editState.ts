import type { State } from '../types';
import createActivitiesGraph from './createActivitiesGraph';
import deriveState from './deriveState';
import { appendToJournal, getJournalNodes } from './private/graphJournal';
import WorkingGraph, { type FlushResult } from './private/WorkingGraph';

/**
 * Runs one store transaction for a `State`, then derives the next `State`.
 *
 * - **Stale state** (an older state reduced again, e.g. replay or time travel, or the last edit threw): the graph has
 *   moved on, so a new graph is built from this state's journal, then edited.
 * - **Failure**: William's store has no rollback. `ActivitiesGraph.edit()` bumps the version also when the editor
 *   throws, so the state from before the failed action becomes stale and the next action rebuilds the graph from it.
 *
 * @param editor Edits the graph. Returns `false` if nothing changed.
 */
export default function editState(state: State, editor: (working: WorkingGraph) => boolean): State {
  const graph =
    state.graph && state.graph.version === state.graphVersion
      ? state.graph
      : createActivitiesGraph(getJournalNodes(state.graphJournal));

  let result: FlushResult | undefined;

  graph.edit(transaction => {
    const working = new WorkingGraph(transaction, graph.store.getSnapshot(), state.graphPartIndex);

    if (editor(working)) {
      result = working.flush();
    }
  });

  if (!result) {
    // Nothing changed. The graph may have been rebuilt from this state.
    return graph === state.graph ? state : Object.freeze({ ...state, graph, graphVersion: graph.version });
  }

  return deriveState(graph, state, {
    ...result,
    graphJournal: appendToJournal(state.graphJournal, result.changedNodes)
  });
}
