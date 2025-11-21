/* eslint-disable complexity */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

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
import type { GlobalScopePonyfill } from '../../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../../types/WebChatActivity';
import getPermaIdAByActivityId from './sort/getPermaIdByActivityId';
import getPermaIdAByClientActivityId from './sort/getPermaIdByClientActivityId';
import type { State } from './sort/types';
import updateActivityChannelData, {
  updateActivityChannelDataInternalSkipNameCheck
} from './sort/updateActivityChannelData';
import upsert, { INITIAL_STATE } from './sort/upsert';
import patchActivity from './patchActivity';

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
  ponyfill: GlobalScopePonyfill
): Reducer<GroupedActivitiesState, GroupedActivitiesAction> {
  return function activities(
    state: GroupedActivitiesState = DEFAULT_STATE,
    action: GroupedActivitiesAction
  ): GroupedActivitiesState {
    switch (action.type) {
      case DELETE_ACTIVITY:
        // TODO: [P*] Brew this.
        // state = updateIn(state, [({ id }: WebChatActivity) => id === action.payload.activityID]);
        break;

      case MARK_ACTIVITY: {
        const permaId = getPermaIdAByActivityId(state, action.payload.activityID);

        if (permaId) {
          state = updateActivityChannelData(state, permaId, action.payload.name, action.payload.value);
        }

        break;
      }

      case POST_ACTIVITY_PENDING: {
        let {
          payload: { activity }
        } = action;

        activity = patchActivity(activity, ponyfill);

        // TODO: [P*] Use v6() with sequential so we can kind of sort over it.
        activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => v4());
        // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
        // Please refer to #4362 for details. Remove on or after 2024-07-31.
        activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
        activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENDING);

        state = upsert(ponyfill, state, activity);

        break;
      }

      case POST_ACTIVITY_IMPEDED: {
        const permaId = getPermaIdAByClientActivityId(state, action.meta.clientActivityID);

        if (permaId) {
          state = updateActivityChannelDataInternalSkipNameCheck(
            state,
            permaId,
            // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
            // Please refer to #4362 for details. Remove on or after 2024-07-31.
            'state',
            SEND_FAILED
          );
        }

        break;
      }

      case POST_ACTIVITY_REJECTED: {
        const permaId = getPermaIdAByClientActivityId(state, action.meta.clientActivityID);

        if (permaId) {
          state = updateActivityChannelDataInternalSkipNameCheck(state, permaId, 'state', SEND_FAILED);
          state = updateActivityChannelDataInternalSkipNameCheck(state, permaId, 'webchat:send-status', SEND_FAILED);
        }

        break;
      }

      case POST_ACTIVITY_FULFILLED: {
        const permaId = getPermaIdAByClientActivityId(state, action.meta.clientActivityID);

        const existingActivity = permaId && state.activityMap.get(permaId)?.activity;

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

        activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENT);

        activity = updateIn(
          activity,
          ['channelData', 'webchat:internal:id'],
          () => existingActivity.channelData['webchat:internal:id']
        );

        // Keep existing position.
        activity = updateIn(
          activity,
          ['channelData', 'webchat:internal:position'],
          () => existingActivity.channelData['webchat:internal:position']
        );

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

        activity = patchActivity(activity, ponyfill);

        // Clean internal properties if they were passed from chat adapter.
        // These properties should not be passed from external systems.
        activity = updateIn(activity, ['channelData', 'webchat:internal:id']);
        activity = updateIn(activity, ['channelData', 'webchat:internal:position']);
        activity = updateIn(activity, ['channelData', 'webchat:send-status']);

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

          // TODO: [P*] Should find using permanent ID.
          const existingActivity = state.sortedActivities.find(
            activity =>
              (clientActivityID && getClientActivityID(activity) === clientActivityID) || (id && activity.id === id)
          );

          if (existingActivity) {
            const {
              channelData: { 'webchat:internal:id': permanentId, 'webchat:send-status': sendStatus }
            } = existingActivity;

            activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => permanentId);

            if (sendStatus === SENDING || sendStatus === SEND_FAILED || sendStatus === SENT) {
              activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => sendStatus);
            }
          } else {
            activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => v4());

            // If there are no existing activity, probably this activity is restored from chat history.
            // All outgoing activities restored from service means they arrived at the service successfully.
            // Thus, we are marking them as "sent".
            activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENT);
          }
        } else {
          if (!activity.id) {
            const newActivityId = v4();

            console.warn(
              'botframework-webchat: Incoming activity must have "id" field set, assigning a random value as ID',
              {
                activity,
                newActivityId
              }
            );

            activity = updateIn(activity, ['id'], () => newActivityId);
          }

          // TODO: [P*] Should find using permanent ID.
          const permaId = getPermaIdAByActivityId(state, activity.id!);
          const existingActivityEntry = permaId && state.activityMap.get(permaId);

          if (existingActivityEntry) {
            activity = updateIn(
              activity,
              ['channelData', 'webchat:internal:id'],
              () => existingActivityEntry.activity.channelData['webchat:internal:id']
            );
          } else {
            activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => v4());
          }
        }

        state = upsert(ponyfill, state, activity);

        break;
      }

      default:
        break;
    }

    return state;
  };
}

export default createGroupedActivitiesReducer;
export type { GroupedActivitiesAction, GroupedActivitiesState };
