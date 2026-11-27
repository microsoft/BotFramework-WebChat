import incomingActivity, { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { QUEUE_INCOMING_ACTIVITY } from '../../actions/queueIncomingActivity';
import setSuggestedActions from '../../actions/setSuggestedActions';
import activityFromBot from '../../definitions/activityFromBot';
import activitiesSelector, { ofType as activitiesOfType } from '../../selectors/activities';
import type { WebChatActivity } from '../../types/WebChatActivity';
import { is } from '../private/effects';
import type { Machine, MachineAction, Scope } from '../types';

// We will hold up the replying activity if the originating activity did not arrive, up to 5 seconds.
const REPLY_TIMEOUT = 5000;

// Whether the activity replied to, or another reply to it, is in the transcript.
const hasReplied = (activities: readonly WebChatActivity[], replyToId: string): boolean =>
  !!activities.find(activity => activity.id === replyToId || activity.replyToId === replyToId);

/**
 * Races the activity replied to (it arrives in the transcript) against a 5 seconds timeout. Calls `then` with `true` if
 * it timed out. If already replied, `then` is called now and the timer never starts.
 */
function waitForActivityId(
  worker: Scope,
  replyToId: string,
  initialActivities: readonly WebChatActivity[],
  then: (timedOut: boolean) => void
): void {
  if (hasReplied(initialActivities, replyToId)) {
    return then(false);
  }

  let stopTaking: () => void;
  // eslint-disable-next-line prefer-const
  let stopSleeping: () => void;

  const takeIncomingActivity = () => {
    stopTaking = worker.take(is(INCOMING_ACTIVITY), action => {
      const {
        payload: { activity }
      } = action;

      if (activity.id === replyToId || hasReplied(worker.select(activitiesSelector), replyToId)) {
        stopSleeping();
        then(false);
      } else {
        takeIncomingActivity();
      }
    });
  };

  takeIncomingActivity();

  stopSleeping = worker.sleep(REPLY_TIMEOUT, () => {
    stopTaking();
    then(true);
  });
}

function queueIncomingActivity(
  worker: Scope,
  userID: string,
  { payload: { activity } }: MachineAction,
  initialActivities: readonly WebChatActivity[]
): void {
  const release = () =>
    worker.put(incomingActivity(activity), () => {
      // Update suggested actions
      // TODO: [P3] We could put this logic inside reducer to minimize number of actions dispatched.
      const messageActivities = worker.select(activitiesOfType('message'));
      const lastMessageActivity = messageActivities[messageActivities.length - 1];

      if (activityFromBot(lastMessageActivity)) {
        const { suggestedActions: { actions, to } = { actions: undefined, to: undefined } } =
          lastMessageActivity as any;

        // If suggested actions is not destined to anyone, or is destined to the user, show it.
        // In other words, if suggested actions is destined to someone else, don't show it.
        const suggestedActions = to?.length && !to.includes(userID) ? null : actions;

        worker.put(
          suggestedActions ? setSuggestedActions(suggestedActions, lastMessageActivity) : setSuggestedActions()
        );
      }
    });

  // This is for resolving an accessibility issue.
  // If the incoming activity has "replyToId" field, hold on it until the activity replied to is in the transcript, then release this one.
  const { replyToId } = activity;
  const initialBotActivities = initialActivities.filter(({ from: { role } }) => role === 'bot');

  // To speed up the first activity render time, we do not delay the first activity from the bot.
  // Even if it is the first activity from the bot, the bot might be "replying" to the "conversationUpdate" event.
  // Thus, the "replyToId" will always be there even it is the first activity in the conversation.
  if (replyToId && initialBotActivities.length) {
    // Either the activity replied to is in the transcript or after timeout.
    waitForActivityId(worker, replyToId, initialActivities, timedOut => {
      timedOut &&
        console.warn(
          `botframework-webchat: Timed out while waiting for activity "${replyToId}" which activity "${activity.id}" is replying to.`,
          {
            activity,
            replyToId
          }
        );

      release();
    });
  } else {
    release();
  }
}

/**
 * While online, each activity queued (by Direct Line or the host) goes to the transcript (`INCOMING_ACTIVITY`), then the
 * suggested actions of the last message are set. A reply to an activity not in the transcript yet is held until it is
 * there, or for 5 seconds, unless the bot has not spoken yet.
 *
 * The transcript is selected as the queued activity is taken, so no activity slips between the two.
 */
const queueIncomingActivityMachine: Machine = scope =>
  scope.whileOnline(({ userID }, online) =>
    online.on(is(QUEUE_INCOMING_ACTIVITY), (action, worker) =>
      queueIncomingActivity(worker, userID, action, worker.select(activitiesSelector))
    )
  );

export default queueIncomingActivityMachine;
