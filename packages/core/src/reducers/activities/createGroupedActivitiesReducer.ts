/* eslint-disable complexity */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

// @ts-ignore No @types/simple-update-in
import updateIn from 'simple-update-in';
import { v4 } from 'uuid';

import { DELETE_ACTIVITY } from '../../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { MARK_ACTIVITY } from '../../actions/markActivity';
import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../../actions/postActivity';
import { SENDING, SEND_FAILED, SENT } from '../../types/internal/SendStatus';

import type { Reducer } from 'redux';
import type { DeleteActivityAction } from '../../actions/deleteActivity';
import type { IncomingActivityAction } from '../../actions/incomingActivity';
import type { MarkActivityAction } from '../../actions/markActivity';
import type {
  PostActivityFulfilledAction,
  PostActivityImpededAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../../actions/postActivity';
import { IncomingActivityEvent, type InternalNativeAPI } from '../../nativeAPI/index';
import type { GlobalScopePonyfill } from '../../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../../types/WebChatActivity';
import patchActivity from './patchActivity';
import deleteActivityByLocalId from './sort/deleteActivityByLocalId';
import { generateLocalIdInActivity, getLocalIdFromActivity, setLocalIdInActivity } from './sort/property/LocalId';
import { getPositionFromActivity, setPositionInActivity } from './sort/property/Position';
import { setReceivedAtInActivity } from './sort/property/ReceivedAt';
import { querySendStatusFromOutgoingActivity, setSendStatusInOutgoingActivity } from './sort/property/SendStatus';
import queryLocalIdAByActivityId from './sort/queryLocalIdByActivityId';
import queryLocalIdAByClientActivityId from './sort/queryLocalIdByClientActivityId';
import type { State } from './sort/types';
import updateActivityChannelData, {
  updateActivityChannelDataInternalSkipNameCheck
} from './sort/updateActivityChannelData';
import upsert, { INITIAL_STATE } from './sort/upsert';

type GroupedActivitiesAction =
  | DeleteActivityAction
  | IncomingActivityAction
  | MarkActivityAction
  | PostActivityFulfilledAction
  | PostActivityImpededAction
  | PostActivityPendingAction
  | PostActivityRejectedAction;

type GroupedActivitiesState = State;

const DEFAULT_STATE: GroupedActivitiesState = INITIAL_STATE;

function getClientActivityID(activity: WebChatActivity): string | undefined {
  return activity.channelData?.clientActivityID;
}

function createGroupedActivitiesReducer(
  ponyfill: GlobalScopePonyfill,
  internalNativeAPI: InternalNativeAPI
): Reducer<GroupedActivitiesState, GroupedActivitiesAction> {
  return function activities(
    state: GroupedActivitiesState = DEFAULT_STATE,
    action: GroupedActivitiesAction
  ): GroupedActivitiesState {
    switch (action.type) {
      case DELETE_ACTIVITY: {
        console.warn(
          'botframework-webchat: Delete activity is being deprecated, please build your own chat adapter instead.'
        );

        const localId = queryLocalIdAByActivityId(state, action.payload.activityID);

        if (localId) {
          state = deleteActivityByLocalId(state, localId);
        }

        break;
      }

      case MARK_ACTIVITY: {
        // We need to deprecate this, however, it is currently using by speech.

        const localId = queryLocalIdAByActivityId(state, action.payload.activityID);

        if (localId) {
          state = updateActivityChannelData(state, localId, action.payload.name, action.payload.value);
        }

        break;
      }

      case POST_ACTIVITY_PENDING: {
        let {
          payload: { activity }
        } = action;

        // Patch activity so the outgoing blob: URL is not re-downloadable.
        // Related to /__tests__/html2/accessibility/liveRegion/attachment/file.

        // Why not re-downloadable?
        // - When the activity echo back, the URL will be dummy (not downloadable)
        // - Outgoing -> echo back, the UI will be "downloadable" and flash to "not downloadable" in a short amount of time

        // TODO: [P0] Consider modify attachment middleware so all outgoing activity is not downloadable.

        activity = patchActivity(activity, ponyfill);
        activity = setReceivedAtInActivity(activity, ponyfill.Date.now());
        activity = generateLocalIdInActivity(activity);
        // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
        // Please refer to #4362 for details. Remove on or after 2024-07-31.
        activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
        activity = setSendStatusInOutgoingActivity(activity, SENDING);

        state = upsert(ponyfill, state, activity);

        break;
      }

      case POST_ACTIVITY_IMPEDED: {
        const localId = queryLocalIdAByClientActivityId(state, action.meta.clientActivityID);

        if (localId) {
          state = updateActivityChannelDataInternalSkipNameCheck(
            state,
            localId,
            // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
            // Please refer to #4362 for details. Remove on or after 2024-07-31.
            'state',
            SEND_FAILED
          );
        }

        break;
      }

      case POST_ACTIVITY_REJECTED: {
        const localId = queryLocalIdAByClientActivityId(state, action.meta.clientActivityID);

        if (localId) {
          state = updateActivityChannelDataInternalSkipNameCheck(state, localId, 'state', SEND_FAILED);
          state = updateActivityChannelDataInternalSkipNameCheck(state, localId, 'webchat:send-status', SEND_FAILED);
        }

        break;
      }

      case POST_ACTIVITY_FULFILLED: {
        const localId = queryLocalIdAByClientActivityId(state, action.meta.clientActivityID);

        const existingActivity = localId && state.activityMap.get(localId)?.activity;

        if (!existingActivity) {
          throw new Error(
            'botframework-webchat-internal: On POST_ACTIVITY_FULFILLED, there is no activities with same client activity ID'
          );
        }

        // We will replace the outgoing activity with the version from the server
        let activity = patchActivity(action.payload.activity, ponyfill);

        activity = updateIn(
          activity,
          // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
          // Please refer to #4362 for details. Remove on or after 2024-07-31.
          ['channelData', 'state'],
          () => SENT
        );

        activity = setSendStatusInOutgoingActivity(activity, SENT);
        activity = setLocalIdInActivity(activity, localId);

        // Keep existing position.
        activity = setPositionInActivity(activity, getPositionFromActivity(existingActivity));

        // Compare the INCOMING_ACTIVITY below:
        // - POST_ACTIVITY_FULFILLED will mark send status as SENT
        // - INCOMING_ACTIVITY will not change send status and leave it as-is
        state = upsert(ponyfill, state, activity);

        break;
      }

      case INCOMING_ACTIVITY: {
        let {
          payload: { activity }
        } = action;

        // We cannot call breakpoint inside Redux because DebugContext cannot call getState().
        ponyfill.setTimeout(internalNativeAPI.UNSAFE_callBreakpoint.incomingActivity, 0);
        internalNativeAPI.eventTarget.dispatchEvent(
          new IncomingActivityEvent('incomingactivity', { detail: { activity } })
        );

        activity = patchActivity(activity, ponyfill);

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
        //    - They do not have an ongoing `postActivitySaga`;
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
            ? queryLocalIdAByClientActivityId(state, clientActivityID)
            : id
              ? queryLocalIdAByActivityId(state, id)
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

            console.warn(
              'botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID',
              {
                activity,
                newActivityId: id
              }
            );

            activity = updateIn(activity, ['id'], () => id);
          }

          const existingLocalId = queryLocalIdAByActivityId(state, id);

          if (existingLocalId) {
            activity = setLocalIdInActivity(activity, existingLocalId);
          } else {
            activity = generateLocalIdInActivity(activity);
          }
        }

        state = upsert(ponyfill, state, activity);

        break;
      }

      default:
        break;
    }

    // We cannot call breakpoint inside Redux because DebugContext cannot call getState().
    ponyfill.setTimeout(internalNativeAPI.UNSAFE_callBreakpoint.activitiesChange, 0);

    return state;
  };
}

export default createGroupedActivitiesReducer;
export type { GroupedActivitiesAction, GroupedActivitiesState };
