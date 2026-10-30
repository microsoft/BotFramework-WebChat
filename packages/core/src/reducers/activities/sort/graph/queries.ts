import { CONVERSATION_ID, type ActivitiesGraph } from './createActivitiesGraph';
import getSortedMessages from './getSortedMessages';
import { getActivity } from './private/nodeProperties';
import type { Activity } from '../types';

function* getTranscriptActivities({ store }: ActivitiesGraph): Generator<Activity> {
  const snapshot = store.getSnapshot();

  for (const node of getSortedMessages(id => snapshot.get(id), CONVERSATION_ID)) {
    const activity = getActivity(node);

    activity && (yield activity);
  }
}

/**
 * `true` if the transcript has the activity replied to, or another reply to it (the reply already waited once).
 *
 * Same check as `waitForActivityId()` in `queueIncomingActivitySaga.ts` did on `state.activities`.
 */
function hasReplyTarget(graph: ActivitiesGraph, replyToId: string): boolean {
  for (const activity of getTranscriptActivities(graph)) {
    if (activity.id === replyToId || activity.replyToId === replyToId) {
      return true;
    }
  }

  return false;
}

/** `true` if the transcript has an activity from the bot. */
function hasBotActivity(graph: ActivitiesGraph): boolean {
  for (const activity of getTranscriptActivities(graph)) {
    if (activity.from.role === 'bot') {
      return true;
    }
  }

  return false;
}

export { hasBotActivity, hasReplyTarget };
