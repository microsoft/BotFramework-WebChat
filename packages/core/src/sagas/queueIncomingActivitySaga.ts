import { buffers, channel, type Channel } from 'redux-saga';
import { fork, put, select, take } from 'redux-saga/effects';

import incomingActivity from '../actions/incomingActivity';
import { QUEUE_INCOMING_ACTIVITY } from '../actions/queueIncomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import activityFromBot from '../definitions/activityFromBot';
import type { ActivitiesGraph } from '../reducers/activities/sort/graph/createActivitiesGraph';
import { hasBotActivity, hasReplyTarget } from '../reducers/activities/sort/graph/queries';
import { ofType as activitiesOfType } from '../selectors/activities';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { ReduxState } from '../types/internal/ReduxState';
import type { WebChatActivity } from '../types/WebChatActivity';
import ReplyToIdHold from './private/ReplyToIdHold';
import whileConnected from './effects/whileConnected';

// The activities graph (William's store) is mutable: the same instance stays current, the state only replaces it if the
// state is replaced (e.g. rehydrated).
const graphSelector = ({ groupedActivities }: ReduxState): ActivitiesGraph | undefined => groupedActivities.graph;

function* queueIncomingActivity({ userID }: { userID: string }, ponyfill: GlobalScopePonyfill) {
  let graph: ActivitiesGraph | undefined = yield select(graphSelector);

  const releaseChannel: Channel<WebChatActivity> = channel(buffers.expanding());

  // This is for resolving an accessibility issue.
  // If the incoming activity has "replyToId" field, hold on it until the activity replied to is in the transcript, then
  // release this one. The hold reads the transcript from the graph.
  const hold = new ReplyToIdHold<WebChatActivity>({
    clock:
      ponyfill.clearTimeout && ponyfill.setTimeout
        ? { clearTimeout: ponyfill.clearTimeout, setTimeout: ponyfill.setTimeout }
        : undefined,
    hasReplyTarget: replyToId => !!graph && hasReplyTarget(graph, replyToId),
    // To speed up the first activity render time, we do not delay the first activity from the bot.
    // Even if it is the first activity from the bot, the bot might be "replying" to the "conversationUpdate" event.
    // Thus, the "replyToId" will always be there even it is the first activity in the conversation.
    isHoldEnabled: () => !!graph && hasBotActivity(graph),
    release: activity => releaseChannel.put(activity)
  });

  try {
    yield fork(function* queueIncomingActivities() {
      for (;;) {
        const {
          payload: { activity }
        } = yield take(QUEUE_INCOMING_ACTIVITY);

        graph = yield select(graphSelector);

        hold.push(activity);
      }
    });

    for (;;) {
      const activity: WebChatActivity = yield take(releaseChannel);

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

      // The released activity is in the graph now: release replies waiting for it.
      graph = yield select(graphSelector);
      hold.recheck();
    }
  } finally {
    // On disconnect, held activities are dropped, as the saga holding them was cancelled before.
    hold.close();
    releaseChannel.close();
  }
}

export default function* queueIncomingActivitySaga(ponyfill: GlobalScopePonyfill) {
  yield whileConnected(queueIncomingActivity, ponyfill);
}
