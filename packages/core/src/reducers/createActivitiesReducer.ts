/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import updateIn from 'simple-update-in';

import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { MARK_ACTIVITY } from '../actions/markActivity';
import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';
import { SEND_FAILED, SENDING, SENT } from '../types/internal/SendStatus';

import type { DeleteActivityAction } from '../actions/deleteActivity';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type { MarkActivityAction } from '../actions/markActivity';
import type {
  PostActivityFulfilledAction,
  PostActivityImpededAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../actions/postActivity';
import type { Reducer } from 'redux';
import type { WebChatActivity } from '../types/WebChatActivity';

type ActivitiesAction =
  | DeleteActivityAction
  | IncomingActivityAction
  | MarkActivityAction
  | PostActivityFulfilledAction
  | PostActivityImpededAction
  | PostActivityPendingAction
  | PostActivityRejectedAction;

type ActivitiesState = WebChatActivity[];

const DEFAULT_STATE: ActivitiesState = [];
const DIRECT_LINE_PLACEHOLDER_URL =
  'https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png';

function getClientActivityID(activity: WebChatActivity): string | undefined {
  return activity.channelData?.clientActivityID;
}

function findByClientActivityID(clientActivityID: string): (activity: WebChatActivity) => boolean {
  return (activity: WebChatActivity) => getClientActivityID(activity) === clientActivityID;
}

function patchActivity(
  activity: WebChatActivity,
  lastActivity: WebChatActivity,
  { Date }: GlobalScopePonyfill
): WebChatActivity {
  // Direct Line channel will return a placeholder image for the user-uploaded image.
  // As observed, the URL for the placeholder image is https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png.
  // To make our code simpler, we are removing the value if "contentUrl" is pointing to a placeholder image.

  // TODO: [P2] #2869 This "contentURL" removal code should be moved to DirectLineJS adapter.

  // Also, if the "contentURL" starts with "blob:", this means the user is uploading a file (the URL is constructed by URL.createObjectURL)
  // Although the copy/reference of the file is temporary in-memory, to make the UX consistent across page refresh, we do not allow the user to re-download the file either.

  activity = updateIn(activity, ['attachments', () => true, 'contentUrl'], (contentUrl: string) => {
    if (contentUrl !== DIRECT_LINE_PLACEHOLDER_URL && !/^blob:/iu.test(contentUrl)) {
      return contentUrl;
    }
  });

  // If the message does not have sequence ID, use these fallback values:
  // 1. "timestamp" field
  //    - outgoing activity will not have "timestamp" field
  // 2. last activity sequence ID (or 0) + 0.001
  //    - best effort to put this message the last one in the chat history
  activity = updateIn(activity, ['channelData', 'webchat:sequence-id'], (sequenceId?: number) =>
    typeof sequenceId === 'number'
      ? sequenceId
      : typeof activity.timestamp !== 'undefined'
      ? +new Date(activity.timestamp)
      : // We assume there will be no more than 1,000 messages sent before receiving server response.
        // If there are more than 1,000 messages, some messages will get reordered and appear jumpy after receiving server response.
        // eslint-disable-next-line no-magic-numbers
        (lastActivity?.channelData?.['webchat:sequence-id'] || 0) + 0.001
  );

  // TODO: [P1] #3953 We should move this patching logic to a DLJS wrapper for simplicity.
  activity = updateIn(activity, ['channelData', 'webchat:sequence-id'], (sequenceId: number) =>
    typeof sequenceId === 'number' ? sequenceId : +new Date(activity.timestamp || 0) || 0
  );

  return activity;
}

function upsertActivityWithSort(
  activities: WebChatActivity[],
  nextActivity: WebChatActivity,
  ponyfill: GlobalScopePonyfill
): WebChatActivity[] {
  nextActivity = patchActivity(nextActivity, activities[activities.length - 1], ponyfill);

  const { channelData: { clientActivityID: nextClientActivityID, 'webchat:sequence-id': nextSequenceId } = {} } =
    nextActivity;

  const nextActivities = activities.filter(
    ({ channelData: { clientActivityID } = {}, id }) =>
      // We will remove all "sending messages" activities and activities with same ID
      // "clientActivityID" is unique and used to track if the message has been sent and echoed back from the server
      !(nextClientActivityID && clientActivityID === nextClientActivityID) && !(id && id === nextActivity.id)
  );

  // Then, find the right (sorted) place to insert the new activity at, based on sequence ID.
  const indexToInsert = nextActivities.findIndex(
    ({ channelData: { 'webchat:sequence-id': sequenceId } = {} }) => (sequenceId || 0) > (nextSequenceId || 0)
  );

  // If no right place are found, append it
  nextActivities.splice(~indexToInsert ? indexToInsert : nextActivities.length, 0, nextActivity);

  return nextActivities;
}

export default function createActivitiesReducer(
  ponyfill: GlobalScopePonyfill
): Reducer<ActivitiesState, ActivitiesAction> {
  return function activities(state: ActivitiesState = DEFAULT_STATE, action: ActivitiesAction): ActivitiesState {
    switch (action.type) {
      case DELETE_ACTIVITY:
        state = updateIn(state, [({ id }: WebChatActivity) => id === action.payload.activityID]);
        break;

      case MARK_ACTIVITY:
        {
          const { payload } = action;

          state = updateIn(
            state,
            [({ id }: WebChatActivity) => id === payload.activityID, 'channelData', payload.name],
            () => payload.value
          );
        }

        break;

      case POST_ACTIVITY_PENDING:
        {
          let {
            payload: { activity }
          } = action;

          // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
          // Please refer to #4362 for details. Remove on or after 2024-07-31.
          activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
          activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENDING);

          state = upsertActivityWithSort(state, activity, ponyfill);
        }

        break;

      case POST_ACTIVITY_IMPEDED:
        state = updateIn(
          state,
          // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
          // Please refer to #4362 for details. Remove on or after 2024-07-31.
          [findByClientActivityID(action.meta.clientActivityID), 'channelData', 'state'],
          () => SEND_FAILED
        );

        break;

      case POST_ACTIVITY_REJECTED:
        state = updateIn(state, [findByClientActivityID(action.meta.clientActivityID)], activity => {
          activity = updateIn(activity, ['channelData', 'state'], () => SEND_FAILED);

          return updateIn(activity, ['channelData', 'webchat:send-status'], () => SEND_FAILED);
        });

        break;

      case POST_ACTIVITY_FULFILLED:
        state = updateIn(state, [findByClientActivityID(action.meta.clientActivityID)], () => {
          // We will replace the activity with the version from the server
          const activity = updateIn(
            patchActivity(action.payload.activity, state[state.length - 1], ponyfill),
            // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
            // Please refer to #4362 for details. Remove on or after 2024-07-31.
            ['channelData', 'state'],
            () => SENT
          );

          return updateIn(activity, ['channelData', 'webchat:send-status'], () => SENT);
        });

        break;

      case INCOMING_ACTIVITY:
        {
          let {
            payload: { activity }
          } = action;

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

            const existingActivity = state.find(
              activity =>
                (clientActivityID && getClientActivityID(activity) === clientActivityID) || (id && activity.id === id)
            );

            if (existingActivity) {
              const {
                channelData: { 'webchat:send-status': sendStatus }
              } = existingActivity;

              if (sendStatus === SENDING || sendStatus === SEND_FAILED || sendStatus === SENT) {
                activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => sendStatus);
              }
            } else {
              // If there are no existing activity, probably this activity is restored from chat history.
              // All outgoing activities restored from service means they arrived at the service successfully.
              // Thus, we are marking them as "sent".
              activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENT);
            }
          }

          state = upsertActivityWithSort(state, activity, ponyfill);
        }

        break;

      default:
        break;
    }

    return state;
  };
}
