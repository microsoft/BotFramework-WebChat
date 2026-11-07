import type { State } from '../types';

// The transcript as derived from the graph (`State.sortedActivities`, see `deriveState.ts`).

/**
 * `true` if the transcript has the activity replied to, or another reply to it (the reply already waited once).
 *
 * Same check as `waitForActivityId()` in `queueIncomingActivitySaga.ts` did on `state.activities`.
 */
function hasReplyTarget({ sortedActivities }: State, replyToId: string): boolean {
  return sortedActivities.some(activity => activity.id === replyToId || activity.replyToId === replyToId);
}

/** `true` if the transcript has an activity from the bot. */
function hasBotActivity({ sortedActivities }: State): boolean {
  return sortedActivities.some(activity => activity.from.role === 'bot');
}

export { hasBotActivity, hasReplyTarget };
