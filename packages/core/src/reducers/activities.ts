/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import updateIn from 'simple-update-in';

import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { MARK_ACTIVITY } from '../actions/markActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING, POST_ACTIVITY_REJECTED } from '../actions/postActivity';
import { SEND_FAILED, SENDING, SENT } from '../constants/ActivityClientState';
import type { DeleteActivityAction } from '../actions/deleteActivity';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type { MarkActivityAction } from '../actions/markActivity';
import type {
  PostActivityFulfilledAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../actions/postActivity';
import type { WebChatActivity } from '../types/WebChatActivity';

type ActivitiesAction =
  | DeleteActivityAction
  | IncomingActivityAction
  | MarkActivityAction
  | PostActivityFulfilledAction
  | PostActivityPendingAction
  | PostActivityRejectedAction;

type ActivitiesStateType = WebChatActivity[];

const DEFAULT_STATE: ActivitiesStateType = [];
const DIRECT_LINE_PLACEHOLDER_URL =
  'https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png';

function getClientActivityID(activity: WebChatActivity): string | undefined {
  return activity.channelData?.clientActivityID;
}

function findByClientActivityID(clientActivityID: string): (activity: WebChatActivity) => boolean {
  return (activity: WebChatActivity) => getClientActivityID(activity) === clientActivityID;
}

function patchActivity(activity: WebChatActivity, lastActivity: WebChatActivity): WebChatActivity {
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

function upsertActivityWithSort(activities: WebChatActivity[], nextActivity: WebChatActivity): WebChatActivity[] {
  nextActivity = patchActivity(nextActivity, activities[activities.length - 1]);

  const { channelData: { clientActivityID: nextClientActivityID, 'webchat:sequence-id': nextSequenceId } = {} } =
    nextActivity;

  const nextActivities = activities.filter(
    ({ channelData: { clientActivityID } = {}, id }) =>
      // We will remove all "sending messages" activities and activities with same ID
      // "clientActivityID" is unique and used to track if the message has been sent and echoed back from the server
      !(nextClientActivityID && clientActivityID === nextClientActivityID) && !(id && id === nextActivity.id)
  );

  // Then, find the right (sorted) place to insert the new activity at, based on timestamp
  // Since clockskew might happen, we will ignore timestamp on messages that are sending

  const indexToInsert = nextActivities.findIndex(
    ({ channelData: { state, 'webchat:sequence-id': sequenceId } = {} }) =>
      (sequenceId || 0) > (nextSequenceId || 0) && state !== SENDING && state !== SEND_FAILED
  );

  // If no right place are found, append it
  nextActivities.splice(~indexToInsert ? indexToInsert : nextActivities.length, 0, nextActivity);

  return nextActivities;
}

export default function activities(
  state: ActivitiesStateType = DEFAULT_STATE,
  action: ActivitiesAction
): ActivitiesStateType {
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

        activity = updateIn(activity, ['channelData', 'state'], () => SENDING);

        state = upsertActivityWithSort(state, activity);
      }

      break;

    case POST_ACTIVITY_REJECTED:
      state = updateIn(
        state,
        [findByClientActivityID(action.meta.clientActivityID), 'channelData', 'state'],
        () => SEND_FAILED
      );

      break;

    case POST_ACTIVITY_FULFILLED:
      state = updateIn(state, [findByClientActivityID(action.meta.clientActivityID)], () =>
        // We will replace the activity with the version from the server
        updateIn(patchActivity(action.payload.activity, state[state.length - 1]), ['channelData', 'state'], () => SENT)
      );

      break;

    case INCOMING_ACTIVITY:
      // TODO: [P4] #2100 Move "typing" into Constants.ActivityType
      state = upsertActivityWithSort(state, action.payload.activity);

      break;

    default:
      break;
  }

  return state;
}
