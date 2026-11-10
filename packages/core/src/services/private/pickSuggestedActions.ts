import type { DirectLineCardAction } from '../../types/external/DirectLineCardAction';
import type { WebChatActivity } from '../../types/WebChatActivity';

/**
 * The suggested actions to show after an activity reached the transcript, from the last message of the transcript:
 *
 * - `undefined` if the last message is not from the bot (the suggested actions do not change);
 * - otherwise its suggested actions and the message as their origin, or no actions (clear) if it has none or they are
 *   for someone else than the user.
 *
 * Moved from `queueIncomingActivitySaga.ts`; both its machine and the incoming service use it.
 */
export default function pickSuggestedActions(
  activities: readonly WebChatActivity[],
  userID: string
):
  | undefined
  | {
      readonly originActivity?: WebChatActivity | undefined;
      readonly suggestedActions?: readonly DirectLineCardAction[] | undefined;
    } {
  const messageActivities = activities.filter(({ type }) => type === 'message');
  const lastMessageActivity = messageActivities[messageActivities.length - 1];

  if (!lastMessageActivity || lastMessageActivity.from.role !== 'bot') {
    return undefined;
  }

  const { suggestedActions: { actions, to } = { actions: undefined, to: undefined } } = lastMessageActivity as {
    readonly suggestedActions?: { readonly actions?: readonly DirectLineCardAction[]; readonly to?: readonly string[] };
  };

  // If suggested actions is not destined to anyone, or is destined to the user, show it.
  // In other words, if suggested actions is destined to someone else, don't show it.
  const suggestedActions = to?.length && !to.includes(userID) ? null : actions;

  return suggestedActions ? { originActivity: lastMessageActivity, suggestedActions } : {};
}
