import type { GlobalScopePonyfill } from '../../../types/GlobalScopePonyfill';
import { stampActivityPositions, toActivityNode, toSortFacts } from './graph/activityNode';
import { CONVERSATION_ID } from './graph/createActivitiesGraph';
import editState from './graph/editState';
import upsertSortedMessage from './graph/upsertSortedMessage';
import { type Activity, type State } from './types';

// The activities live in William's store (`packages/store`) as a JSON-LD graph:
//
// - Conversation → (Message | livestream session | HowTo) → … → revisions, linked by `isPartOf`,
//   each part with a `position` relative to its parent (`./graph/upsertSortedMessage.ts` has the sorting rules);
// - every upsert is one store transaction: the message, its groupings, every changed `position`,
//   and the public `channelData['webchat:internal:position']` (`stampActivityPositions()`), each node written once;
// - `State` is derived from the graph after each transaction (`./graph/deriveState.ts`), and can rebuild its graph
//   when it is stale (`./graph/editState.ts`).
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
  graphJournal: undefined,
  graphPartIndex: Object.freeze(new Map()),
  graphVersion: 0,
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
 * A state without a graph (e.g. `INITIAL_STATE`), or whose graph has moved on, gets a graph rebuilt from its nodes.
 */
function upsert(ponyfill: Pick<GlobalScopePonyfill, 'Date'>, state: State, activity: Activity): State {
  return editState(state, working => {
    const changed = upsertSortedMessage(
      working,
      CONVERSATION_ID,
      toActivityNode(activity),
      toSortFacts(activity, ponyfill)
    );

    changed && stampActivityPositions(working, CONVERSATION_ID);

    return changed;
  });
}

export default upsert;
export { INITIAL_STATE };
