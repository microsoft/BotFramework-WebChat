import type { GlobalScopePonyfill } from '../../../types/GlobalScopePonyfill';
import { stampActivityPositions, toActivityNode, toSortFacts } from './graph/activityNode';
import createActivitiesGraph, { CONVERSATION_ID } from './graph/createActivitiesGraph';
import deriveState from './graph/deriveState';
import upsertSortedMessage from './graph/upsertSortedMessage';
import { type Activity, type State } from './types';

// The activities live in William's store (`packages/store`) as a JSON-LD graph:
//
// - Conversation → (Message | livestream session | HowTo) → … → revisions, linked by `hasPart`/`isPartOf`,
//   each part with a `position` relative to its parent (`./graph/upsertSortedMessage.ts` has the sorting rules);
// - every upsert is one store transaction: the message, its groupings, every changed `position`,
//   and the public `channelData['webchat:internal:position']` (`stampActivityPositions()`);
// - `State` is derived from the graph after each transaction (`./graph/deriveState.ts`).
//
// Honoring timestamp or not (unchanged):
//
// - Always copy timestamp, except when it's a livestream of 2...N-1 revision
// - Part grouping timestamp is the latest of its parts

const INITIAL_STATE = Object.freeze({
  activityIdToLocalIdMap: Object.freeze(new Map()),
  activityMap: Object.freeze(new Map()),
  clientActivityIdToLocalIdMap: Object.freeze(new Map()),
  graph: undefined,
  livestreamSessionMap: Object.freeze(new Map()),
  howToGroupingMap: Object.freeze(new Map()),
  sortedActivities: Object.freeze([]),
  sortedChatHistoryList: Object.freeze([])
} satisfies State);

// Question: Why insertion sort works but not quick sort?
// Short answer: Arrival order matters.
// Long answer:
// - Update activity: when replacing an activity, data from their previous revision matters
// - Duplicate timestamps: activities without timestamp can't be sort deterministically with quick sort

/**
 * Upserts an activity into the graph of the state, then derives the next state.
 *
 * The graph is mutable: the state passed in must be the latest one (as reducers are called). A state without a graph
 * (e.g. `INITIAL_STATE`) gets a new graph.
 */
function upsert(ponyfill: Pick<GlobalScopePonyfill, 'Date'>, state: State, activity: Activity): State {
  const graph = state.graph ?? createActivitiesGraph();
  let changed = false;

  graph.edit(transaction => {
    changed = upsertSortedMessage(
      transaction,
      CONVERSATION_ID,
      toActivityNode(activity),
      toSortFacts(activity, ponyfill)
    );

    changed && stampActivityPositions(transaction, CONVERSATION_ID);
  });

  return changed ? deriveState(graph) : state;
}

export default upsert;
export { INITIAL_STATE };
