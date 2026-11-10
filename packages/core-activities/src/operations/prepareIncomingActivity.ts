// @ts-ignore No @types/simple-update-in
import updateIn from 'simple-update-in';
import { v4 } from 'uuid';

import type { ActivitiesCoreEnv } from '../ActivitiesCoreEnv';
import patchActivity from '../patchActivity';
import { generateLocalIdInActivity, getLocalIdFromActivity, setLocalIdInActivity } from '../property/LocalId';
import { setPositionInActivity } from '../property/Position';
import { querySendStatusFromOutgoingActivity, setSendStatusInOutgoingActivity } from '../property/SendStatus';
import queryLocalIdByActivityId from '../queryLocalIdByActivityId';
import queryLocalIdByClientActivityId from '../queryLocalIdByClientActivityId';
import type { ActivitiesCoreState } from '../types';
import { SENT } from '../types/internal/SendStatus';
import type { WebChatActivity } from '../types/WebChatActivity';

function getClientActivityID(activity: WebChatActivity): string | undefined {
  return activity.channelData?.clientActivityID;
}

/**
 * Prepares an activity from the chat adapter for `upsert()`: patches it, removes the internal fields the adapter may have
 * sent, and gives it the local ID (and, from the user, the send status) of the activity it replaces, or new ones.
 *
 * `receiveActivity()` is this, then `upsert()`. Core's reducer calls both itself to pass the prepared activity to the
 * `incomingActivity` debug breakpoint.
 */
export default function prepareIncomingActivity(
  state: ActivitiesCoreState,
  activity: WebChatActivity,
  env: ActivitiesCoreEnv
): WebChatActivity {
  activity = patchActivity(activity, env);

  // Clean internal properties if they were passed from chat adapter.
  // These properties should not be passed from external systems.
  activity = setLocalIdInActivity(activity, undefined);
  activity = setPositionInActivity(activity, undefined);
  activity = setSendStatusInOutgoingActivity(activity, undefined);

  // If the incoming activity is an echo back, we should keep the existing `channelData['webchat:send-status']` field.
  //
  // Otherwise, it will fail following scenario:
  //
  // 1. Send an activity to the service
  // 2. Service echoed back the activity
  // 3. Service did NOT return `postActivity` call
  // -  EXPECT: `channelData['webchat:send-status']` should be "sending".
  // -  ACTUAL: `channelData['webchat:send-status']` is `undefined` because the activity get overwritten by the echo back activity.
  //            The echo back activity contains no `channelData['webchat:send-status']`.
  //
  // While we are looking out for the scenario above, we should also look at the following scenarios:
  //
  // 1. Service restore chat history, including activities sent from the user. These activities has the following characteristics:
  //    - They do not have `channelData['webchat:send-status']`;
  //    - They do not have an ongoing post in `postActivityMachine`;
  //    - They should not previously appear in the chat history.
  // 2. We need to mark these activities as "sent".
  //
  // In the future, when we revamp our object model, we could use a different signal so we don't need the code below, for example:
  //
  // -  If `activity.id` is set, it is "sent", because the chat service assigned an ID to the activity;
  // -  If `activity.id` is not set, it is either "sending" or "send failed";
  //    - If `activity.channelData['webchat:send-failed-reason']` is set, it is "send failed" with the reason, otherwise;
  //    - It is sending.
  if (activity.from.role === 'user') {
    const { id } = activity;
    const clientActivityID = getClientActivityID(activity);

    const existingLocalId = clientActivityID
      ? queryLocalIdByClientActivityId(state, clientActivityID)
      : id
        ? queryLocalIdByActivityId(state, id)
        : undefined;
    const existingActivity = existingLocalId && state.activityMap.get(existingLocalId)?.activity;

    if (existingActivity) {
      activity = setLocalIdInActivity(activity, getLocalIdFromActivity(existingActivity));

      const existingSendStatus = querySendStatusFromOutgoingActivity(existingActivity);

      if (typeof existingSendStatus !== 'undefined') {
        activity = setSendStatusInOutgoingActivity(activity, existingSendStatus);
      }
    } else {
      activity = generateLocalIdInActivity(activity);

      // If there are no existing activity, probably this activity is restored from chat history.
      // All outgoing activities restored from service means they arrived at the service successfully.
      // Thus, we are marking them as "sent".
      activity = setSendStatusInOutgoingActivity(activity, SENT);
    }
  } else {
    let { id } = activity;

    if (!id) {
      id = v4();

      console.warn('botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID', {
        activity,
        newActivityId: id
      });

      activity = updateIn(activity, ['id'], () => id);
    }

    const existingLocalId = queryLocalIdByActivityId(state, id);

    if (existingLocalId) {
      activity = setLocalIdInActivity(activity, existingLocalId);
    } else {
      activity = generateLocalIdInActivity(activity);
    }
  }

  return activity;
}
