import {
  hasBotActivity,
  hasReplyTarget,
  ReplyToIdHold,
  type State
} from '@msinternal/botframework-webchat-core-activities';

import incomingActivity, { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { QUEUE_INCOMING_ACTIVITY } from '../../actions/queueIncomingActivity';
import setSuggestedActions from '../../actions/setSuggestedActions';
import pickSuggestedActions from '../../services/private/pickSuggestedActions';
import type { ReduxState } from '../../types/internal/ReduxState';
import type { WebChatActivity } from '../../types/WebChatActivity';
import { is } from '../private/effects';
import type { MachineAction, Scope } from '../types';

// The transcript derived from the activities graph (William's store).
const transcriptSelector = ({ groupedActivities }: ReduxState): State => groupedActivities;
const activitiesSelector = ({ activities }: ReduxState): WebChatActivity[] => activities;

// Takes the next action that matches, again and again, as a `for (;;) { yield take() }` loop.
function takeEach(scope: Scope, match: (action: MachineAction) => boolean, then: (action: MachineAction) => void) {
  const loop = () =>
    scope.take(match, action => {
      then(action);
      loop();
    });

  loop();
}

/**
 * `queueIncomingActivitySaga`: while online, each activity queued (by Direct Line or the host) is received, one at a
 * time, then the suggested actions are set. A reply to an activity not in the transcript yet is held until it is
 * there, or for a while (`ReplyToIdHold`), unless the bot has not spoken yet. Held activities are dropped when offline.
 */
const queueIncomingActivityMachine = (scope: Scope) =>
  scope.whileOnline(({ userID }, online) => {
    const { ponyfill } = online;
    const released = online.channel<WebChatActivity>();
    let transcript: State = online.select(transcriptSelector);

    const hold = new ReplyToIdHold<WebChatActivity>({
      clock:
        ponyfill.clearTimeout && ponyfill.setTimeout
          ? { clearTimeout: ponyfill.clearTimeout, setTimeout: ponyfill.setTimeout }
          : undefined,
      hasReplyTarget: replyToId => hasReplyTarget(transcript, replyToId),
      // The first activity of the bot is not held: even then, it may reply to the "conversationUpdate" event.
      isHoldEnabled: () => hasBotActivity(transcript),
      release: released.put
    });

    online.finally(() => hold.close());

    online.fork(queueing =>
      takeEach(queueing, is(QUEUE_INCOMING_ACTIVITY), ({ payload: { activity } }) => {
        transcript = queueing.select(transcriptSelector);
        hold.push(activity);
      })
    );

    // Every activity that reaches the transcript, from here or not, can release replies waiting for it.
    online.fork(rechecking =>
      takeEach(rechecking, is(INCOMING_ACTIVITY), () => {
        transcript = rechecking.select(transcriptSelector);
        hold.recheck();
      })
    );

    const loop = () =>
      released.take(activity =>
        online.put(incomingActivity(activity), () => {
          const suggestedActions = pickSuggestedActions(online.select(activitiesSelector), userID);

          suggestedActions
            ? online.put(setSuggestedActions(suggestedActions.suggestedActions, suggestedActions.originActivity), loop)
            : loop();
        })
      );

    loop();
  });

export default queueIncomingActivityMachine;
