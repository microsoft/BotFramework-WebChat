import type { ActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { MARK_ACTIVITY } from '../actions/markActivity';
import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';
import type { MachineAction } from '../machines/types';

/**
 * The activities reducer of the Redux store (`createGroupedActivitiesReducer()`) on the activities store: each action
 * calls the operation of the same name. Other actions do nothing.
 */
export default function applyActivitiesAction(activitiesStore: ActivitiesStore, action: MachineAction): void {
  switch (action.type) {
    case DELETE_ACTIVITY:
      console.warn(
        'botframework-webchat: Delete activity is being deprecated, please build your own chat adapter instead.'
      );

      activitiesStore.deleteActivity(action.payload.activityID);
      break;

    case INCOMING_ACTIVITY:
      activitiesStore.receiveActivity(action.payload.activity);
      break;

    case MARK_ACTIVITY:
      activitiesStore.markActivity(action.payload.activityID, action.payload.name, action.payload.value);
      break;

    case POST_ACTIVITY_FULFILLED:
      activitiesStore.postActivityFulfilled(action.meta.clientActivityID, action.payload.activity);
      break;

    case POST_ACTIVITY_IMPEDED:
      activitiesStore.postActivityImpeded(action.meta.clientActivityID);
      break;

    case POST_ACTIVITY_PENDING:
      activitiesStore.postActivityPending(action.payload.activity);
      break;

    case POST_ACTIVITY_REJECTED:
      activitiesStore.postActivityRejected(action.meta.clientActivityID);
      break;

    default:
      break;
  }
}
