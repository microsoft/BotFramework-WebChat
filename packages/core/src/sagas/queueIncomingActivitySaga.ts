import {
  hasBotActivity,
  hasReplyTarget,
  ReplyToIdHold,
  type State
} from '@msinternal/botframework-webchat-core-activities';
import { buffers, channel, type Channel } from 'redux-saga';
import { fork, put, select, take } from 'redux-saga/effects';

import incomingActivity, { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { QUEUE_INCOMING_ACTIVITY } from '../actions/queueIncomingActivity';
import setSuggestedActions from '../actions/setSuggestedActions';
import pickSuggestedActions from '../services/private/pickSuggestedActions';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { ReduxState } from '../types/internal/ReduxState';
import type { WebChatActivity } from '../types/WebChatActivity';
import whileConnected from './effects/whileConnected';

// The transcript derived from the activities graph (William's store).
const transcriptSelector = ({ groupedActivities }: ReduxState): State => groupedActivities;
const activitiesSelector = ({ activities }: ReduxState): WebChatActivity[] => activities;

function* queueIncomingActivity({ userID }: { userID: string }, ponyfill: GlobalScopePonyfill) {
  let transcript: State = yield select(transcriptSelector);

  const releaseChannel: Channel<WebChatActivity> = channel(buffers.expanding());

  // This is for resolving an accessibility issue.
  // If the incoming activity has "replyToId" field, hold on it until the activity replied to is in the transcript, then
  // release this one. The hold reads the transcript derived from the graph.
  const hold = new ReplyToIdHold<WebChatActivity>({
    clock:
      ponyfill.clearTimeout && ponyfill.setTimeout
        ? { clearTimeout: ponyfill.clearTimeout, setTimeout: ponyfill.setTimeout }
        : undefined,
    hasReplyTarget: replyToId => hasReplyTarget(transcript, replyToId),
    // To speed up the first activity render time, we do not delay the first activity from the bot.
    // Even if it is the first activity from the bot, the bot might be "replying" to the "conversationUpdate" event.
    // Thus, the "replyToId" will always be there even it is the first activity in the conversation.
    isHoldEnabled: () => hasBotActivity(transcript),
    release: activity => releaseChannel.put(activity)
  });

  try {
    yield fork(function* queueIncomingActivities() {
      for (;;) {
        const {
          payload: { activity }
        } = yield take(QUEUE_INCOMING_ACTIVITY);

        transcript = yield select(transcriptSelector);

        hold.push(activity);
      }
    });

    // Like `waitForActivityId()` before: every activity that reaches the transcript, from this saga or not, can release
    // replies waiting for it.
    yield fork(function* recheckOnIncomingActivity() {
      for (;;) {
        yield take(INCOMING_ACTIVITY);

        transcript = yield select(transcriptSelector);

        hold.recheck();
      }
    });

    for (;;) {
      const activity: WebChatActivity = yield take(releaseChannel);

      yield put(incomingActivity(activity));

      // Update suggested actions
      // TODO: [P3] We could put this logic inside reducer to minimize number of actions dispatched.
      const suggestedActions = pickSuggestedActions(yield select(activitiesSelector), userID);

      if (suggestedActions) {
        yield put(setSuggestedActions(suggestedActions.suggestedActions, suggestedActions.originActivity));
      }
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
