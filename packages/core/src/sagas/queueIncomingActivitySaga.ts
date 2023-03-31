import { call, cancelled, fork, put, race, select, take } from 'redux-saga/effects';

import { QUEUE_INCOMING_ACTIVITY } from '../actions/queueIncomingActivity';
import activitiesSelector, { ofType as activitiesOfType } from '../selectors/activities';
import activityFromBot from '../definitions/activityFromBot';
import incomingActivity, { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import sleep from '../utils/sleep';
import whileConnected from './effects/whileConnected';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

// We will hold up the replying activity if the originating activity did not arrive, up to 5 seconds.
const REPLY_TIMEOUT = 5000;

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

function* queueIncomingActivity({ userID }: { userID: string }, ponyfill: GlobalScopePonyfill) {
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
      if (replyToId && initialBotActivities.length) {
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
        yield put(setSuggestedActions(to?.length && !to.includes(userID) ? null : actions));
      }
    }
  );
}

export default function* queueIncomingActivitySaga(ponyfill: GlobalScopePonyfill) {
  yield whileConnected(queueIncomingActivity, ponyfill);
}
