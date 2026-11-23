/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

// @ts-ignore No @types/simple-update-in
import updateIn from 'simple-update-in';

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
import type { MarkActivityAction } from '../../actions/markActivity';
import type { PostActivityImpededAction, PostActivityRejectedAction } from '../../actions/postActivity';
import type {
  PreparedIncomingActivityAction,
  PreparedPostActivityFulfilledAction,
  PreparedPostActivityPendingAction
} from '../../prepare/types';
import patchActivity from './patchActivity';
import deleteActivityByLocalId from './sort/deleteActivityByLocalId';
import { setLocalIdInActivity, setNewLocalIdInActivity } from './sort/property/LocalId';
import { getPositionFromActivity, setPositionInActivity } from './sort/property/Position';
import { setSendStatusInOutgoingActivity } from './sort/property/SendStatus';
import queryLocalIdAByActivityId from './sort/queryLocalIdByActivityId';
import queryLocalIdAByClientActivityId from './sort/queryLocalIdByClientActivityId';
import type { State } from './sort/types';
import updateActivityChannelData, {
  updateActivityChannelDataInternalSkipNameCheck
} from './sort/updateActivityChannelData';
import upsert, { INITIAL_STATE } from './sort/upsert';
import toIncomingActivity from './toIncomingActivity';

type GroupedActivitiesAction =
  | DeleteActivityAction
  | MarkActivityAction
  | PostActivityImpededAction
  | PostActivityRejectedAction
  | PreparedIncomingActivityAction
  | PreparedPostActivityFulfilledAction
  | PreparedPostActivityPendingAction;

type GroupedActivitiesState = State;

const DEFAULT_STATE: GroupedActivitiesState = INITIAL_STATE;

const groupedActivities: Reducer<GroupedActivitiesState, GroupedActivitiesAction> = function activities(
  state: GroupedActivitiesState = DEFAULT_STATE,
  action: GroupedActivitiesAction
): GroupedActivitiesState {
  switch (action.type) {
    case DELETE_ACTIVITY: {
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

      activity = patchActivity(activity, action.meta.now);
      activity = setNewLocalIdInActivity(activity, action.meta.localId);
      // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
      // Please refer to #4362 for details. Remove on or after 2024-07-31.
      activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
      activity = setSendStatusInOutgoingActivity(activity, SENDING);

      state = upsert(state, activity);

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
      let activity = patchActivity(action.payload.activity, action.meta.now);

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
      state = upsert(state, activity);

      break;
    }

    case INCOMING_ACTIVITY: {
      state = upsert(state, toIncomingActivity(state, action));

      break;
    }

    default:
      break;
  }

  return state;
};

export default groupedActivities;
export type { GroupedActivitiesAction, GroupedActivitiesState };
