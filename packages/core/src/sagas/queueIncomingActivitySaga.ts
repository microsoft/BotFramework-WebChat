import { call, cancelled, fork, put, race, select, take } from 'redux-saga/effects';

import incomingActivity, { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { QUEUE_INCOMING_ACTIVITY } from '../actions/queueIncomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import activityFromBot from '../definitions/activityFromBot';
import activitiesSelector, { ofType as activitiesOfType } from '../selectors/activities';
import sleep from '../utils/sleep';
import whileConnected from './effects/whileConnected';

import type { DirectLineJSBotConnection } from '../types/external/DirectLineJSBotConnection';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

// We will hold up the replying activity if the originating activity did not arrive, up to 5 seconds.
const REPLY_TIMEOUT = 5000;

/**
 * Returns whether the DirectLine adapter is operating in voice (bi-directional WebSocket) mode.
 *
 * In text mode we delay rendering a bot reply until the activity it references via `replyToId`
 * appears in the transcript — this keeps the visual order accessible.
 *
 * Voice mode invalidates that assumption:
 * - The client does not send an `activity.id`, and the server-assigned id is never echoed back,
 *   so `replyToId` on incoming activities never matches anything already in the transcript.
 * - Traffic is bi-directional over the same WebSocket, so an incoming activity always arrives
 *   after the outgoing one — visual order is implicitly correct.
 *
 * Therefore, when voice mode is enabled we skip the `replyToId` wait to avoid blocking the UI
 * for an activity that will never arrive.
 */
function isVoiceEnabled(directLine: DirectLineJSBotConnection): boolean {
  if (typeof directLine.getIsVoiceModeEnabled === 'function') {
    try {
      return Boolean(directLine.getIsVoiceModeEnabled());
    } catch {
      return false;
    }
  }

  return false;
}

function* takeEveryAndSelect(actionType, selector, fn) {
  // select() will free up the code execution.
  // If we pair up with takeEvery(), it will allow actions to slip through.
  // Thus, we are writing one that don't use takeEvery().
  while (!(yield cancelled())) {
    const action = yield take(actionType);
    const state = yield select(selector);

    yield fork(fn, action, state);
  }
}

// Wait for specific activity to arrive in the transcript.
// We will use the initial set of activities to close time gaps between select() and take().
// If another activity with the same "replyToId" is already rendered (in the "activities" array),
// we will skip the wait as we already waited long enough for the missing activity to show up.
function* waitForActivityId(replyToId, initialActivities) {
  let activities = initialActivities;

  for (;;) {
    const replied = activities.find(activity => activity.id === replyToId || activity.replyToId === replyToId);

    if (replied) {
      break;
    }

    const {
      payload: { activity }
    } = yield take(INCOMING_ACTIVITY);

    if (activity.id === replyToId) {
      break;
    }

    activities = yield select(activitiesSelector);
  }
}

function* queueIncomingActivity(
  { directLine, userID }: { directLine: DirectLineJSBotConnection; userID: string },
  ponyfill: GlobalScopePonyfill
) {
  const voiceModeEnabled = isVoiceEnabled(directLine);

  yield takeEveryAndSelect(
    QUEUE_INCOMING_ACTIVITY,
    activitiesSelector,
    function* queueIncomingActivity({ payload: { activity } }, initialActivities) {
      // This is for resolving an accessibility issue.
      // If the incoming activity has "replyToId" field, hold on it until the activity replied to is in the transcript, then release this one.
      const { replyToId } = activity;
      const initialBotActivities = initialActivities.filter(({ from: { role } }) => role === 'bot');

      // To speed up the first activity render time, we do not delay the first activity from the bot.
      // Even if it is the first activity from the bot, the bot might be "replying" to the "conversationUpdate" event.
      // Thus, the "replyToId" will always be there even it is the first activity in the conversation.
      if (replyToId && initialBotActivities.length && !voiceModeEnabled) {
        // Either the activity replied to is in the transcript or after timeout.
        const result = yield race({
          _: waitForActivityId(replyToId, initialActivities),
          timeout: call(sleep, REPLY_TIMEOUT, ponyfill)
        });

        if ('timeout' in result) {
          console.warn(
            `botframework-webchat: Timed out while waiting for activity "${replyToId}" which activity "${activity.id}" is replying to.`,
            {
              activity,
              replyToId
            }
          );
        }
      }

      yield put(incomingActivity(activity));

      // Update suggested actions
      // TODO: [P3] We could put this logic inside reducer to minimize number of actions dispatched.
      const messageActivities = yield select(activitiesOfType('message'));
      const lastMessageActivity = messageActivities[messageActivities.length - 1];

      if (activityFromBot(lastMessageActivity)) {
        const { suggestedActions: { actions, to } = { actions: undefined, to: undefined } } = lastMessageActivity;

        // If suggested actions is not destined to anyone, or is destined to the user, show it.
        // In other words, if suggested actions is destined to someone else, don't show it.
        const suggestedActions = to?.length && !to.includes(userID) ? null : actions;

        if (suggestedActions) {
          yield put(setSuggestedActions(suggestedActions, lastMessageActivity));
        } else {
          yield put(setSuggestedActions());
        }
      }
    }
  );
}

export default function* queueIncomingActivitySaga(ponyfill: GlobalScopePonyfill) {
  yield whileConnected(queueIncomingActivity, ponyfill);
}
