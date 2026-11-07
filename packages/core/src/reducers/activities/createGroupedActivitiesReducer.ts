import { DELETE_ACTIVITY } from '../../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { MARK_ACTIVITY } from '../../actions/markActivity';
import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../../actions/postActivity';

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
import { type RestrictedStoreDebugAPI } from '../../types/StoreDebugAPI';
import {
  createInitialState,
  deleteActivityById,
  markActivity,
  postActivityFulfilled,
  postActivityImpeded,
  postActivityPending,
  postActivityRejected,
  prepareIncomingActivity,
  upsert,
  type State
} from '@msinternal/botframework-webchat-core-activities';

type GroupedActivitiesAction =
  | DeleteActivityAction
  | IncomingActivityAction
  | MarkActivityAction
  | PostActivityFulfilledAction
  | PostActivityImpededAction
  | PostActivityPendingAction
  | PostActivityRejectedAction;

type GroupedActivitiesState = State;

/**
 * The activities core (`@msinternal/botframework-webchat-core-activities`) as a Redux reducer: each action calls the
 * operation of the same name. The operations are pure, and accept an older state too (replay, time travel).
 */
function createGroupedActivitiesReducer(
  ponyfill: GlobalScopePonyfill,
  restrictedStoreDebugAPI: RestrictedStoreDebugAPI
): Reducer<GroupedActivitiesState, GroupedActivitiesAction> {
  // One graph (William's store) per Redux store, created upfront so sagas can read it before the first activity.
  const defaultState: GroupedActivitiesState = createInitialState();

  return function activities(
    state: GroupedActivitiesState = defaultState,
    action: GroupedActivitiesAction
  ): GroupedActivitiesState {
    switch (action.type) {
      case DELETE_ACTIVITY:
        console.warn(
          'botframework-webchat: Delete activity is being deprecated, please build your own chat adapter instead.'
        );

        return deleteActivityById(state, action.payload.activityID);

      case MARK_ACTIVITY:
        // We need to deprecate this, however, it is currently using by speech.
        return markActivity(state, action.payload.activityID, action.payload.name, action.payload.value);

      case POST_ACTIVITY_PENDING:
        return postActivityPending(state, action.payload.activity, ponyfill);

      case POST_ACTIVITY_IMPEDED:
        return postActivityImpeded(state, action.meta.clientActivityID);

      case POST_ACTIVITY_REJECTED:
        return postActivityRejected(state, action.meta.clientActivityID);

      case POST_ACTIVITY_FULFILLED:
        return postActivityFulfilled(state, action.meta.clientActivityID, action.payload.activity, ponyfill);

      case INCOMING_ACTIVITY: {
        let {
          payload: { activity }
        } = action;

        // We cannot call breakpoint inside Redux because DebugContext cannot call getState(), need setTimeout.
        // The breakpoint gets the prepared activity (`receiveActivity()` is `prepareIncomingActivity()`, then `upsert()`).
        queueMicrotask(() => restrictedStoreDebugAPI.UNSAFE_callBreakpoint.incomingActivity({ activity }));

        activity = prepareIncomingActivity(state, activity, ponyfill);

        return upsert(ponyfill, state, activity);
      }

      default:
        return state;
    }
  };
}

export default createGroupedActivitiesReducer;
export type { GroupedActivitiesAction, GroupedActivitiesState };
