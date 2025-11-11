/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import updateIn from 'simple-update-in';
import { v4 } from 'uuid';

import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { MARK_ACTIVITY } from '../actions/markActivity';
import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';
import { SENDING, SEND_FAILED, SENT } from '../types/internal/SendStatus';
import getActivityLivestreamingMetadata from '../utils/getActivityLivestreamingMetadata';
import getOrgSchemaMessage from '../utils/getOrgSchemaMessage';

import type { Reducer } from 'redux';
import type { DeleteActivityAction } from '../actions/deleteActivity';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type { MarkActivityAction } from '../actions/markActivity';
import type {
  PostActivityFulfilledAction,
  PostActivityImpededAction,
  PostActivityPendingAction,
  PostActivityRejectedAction
} from '../actions/postActivity';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../types/WebChatActivity';
import compose, { type ComposeFn } from './private/compose';

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

/**
 * Get sequence ID from `activity.channelData['webchat:sequence-id']` and fallback to `+new Date(activity.timestamp)`.
 *
 * Chat adapter may send sequence ID to affect activity reordering. Sequence ID is supposed to be Unix timestamp.
 *
 * @param activity Activity to get sequence ID from.
 * @returns Sequence ID.
 */
function getSequenceIdOrDeriveFromTimestamp(
  activity: WebChatActivity,
  ponyfill: GlobalScopePonyfill
): number | undefined {
  return activity.channelData?.['webchat:sequence-id'] ?? (+new ponyfill.Date(activity.timestamp) || undefined);
}

function patchActivity(activity: WebChatActivity, { Date }: GlobalScopePonyfill): WebChatActivity {
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

  activity = updateIn(activity, ['channelData'], channelData => ({ ...channelData }));
  activity = updateIn(activity, ['channelData', 'webChat', 'receivedAt'], () => Date.now());

  const messageEntity = getOrgSchemaMessage(activity.entities);
  const entityPosition = messageEntity?.position;
  const entityPartOf = messageEntity?.isPartOf?.['@id'];

  if (typeof entityPosition === 'number') {
    activity = updateIn(activity, ['channelData', 'webchat:entity-position'], () => entityPosition);
  }

  if (typeof entityPartOf === 'string') {
    activity = updateIn(activity, ['channelData', 'webchat:entity-part-of'], () => entityPartOf);
  }

  return activity;
}

function upsertActivityWithSort(
  activities: WebChatActivity[],
  incomingActivity: WebChatActivity,
  ponyfill: GlobalScopePonyfill
): WebChatActivity[] {
  const incomingLivestreamingMetadata = getActivityLivestreamingMetadata(incomingActivity);

  // TODO: [P1] To support time-travelling, we should not drop obsoleted livestreaming activities.
  if (incomingLivestreamingMetadata) {
    const { sessionId } = incomingLivestreamingMetadata;

    // If the upserting activity is going upsert into a concluded livestream, skip the activity.
    const isLivestreamConcluded = activities.find(targetActivity => {
      const targetMetadata = getActivityLivestreamingMetadata(targetActivity);

      return targetMetadata?.sessionId === sessionId && targetMetadata.type === 'final activity';
    });

    if (isLivestreamConcluded) {
      return activities;
    }
  }

  incomingActivity = patchActivity(incomingActivity, ponyfill);

  const { channelData: { clientActivityID: incomingClientActivityID } = {} } = incomingActivity;

  const nextActivities = activities.filter(
    ({ channelData: { clientActivityID } = {}, id }) =>
      // We will remove all "sending messages" activities and activities with same ID
      // "clientActivityID" is unique and used to track if the message has been sent and echoed back from the server
      !(incomingClientActivityID && clientActivityID === incomingClientActivityID) &&
      !(id && id === incomingActivity.id)
  );

  const incomingEntityPosition = incomingActivity.channelData?.['webchat:entity-position'];
  const incomingPartOf = incomingActivity.channelData?.['webchat:entity-part-of'];
  const incomingSequenceId = getSequenceIdOrDeriveFromTimestamp(incomingActivity, ponyfill);

  // TODO: [P0] Turn (activity) => boolean into comparer (x, y) => number.
  //       It is not trivial to write in current form.
  //       We can use comparer for insertion sort too, so let's rewrite in comparer form.
  let indexToInsert = nextActivities.findIndex(activity => {
    // TODO: [P1] #3953 We should move this patching logic to a DLJS wrapper for simplicity.
    // If the message does not have sequence ID, use these fallback values:
    // 1. `entities.position` where `entities.isPartOf[@type === 'HowTo']`
    //    - If they are not of same set, ignore `entities.position`
    // 2. `channelData.streamSequence` field for same session IDk
    // 3. `channelData['webchat:sequence-id']`
    //    - If not available, it will fallback to `+new Date(timestamp)`
    //    - Outgoing activity will not have `timestamp` field
    const { channelData = {} } = activity;
    const currentEntityPosition = channelData['webchat:entity-position'];
    const currentEntityPartOf = channelData['webchat:entity-part-of'];

    const bothHavePosition = typeof currentEntityPosition === 'number' && typeof incomingEntityPosition === 'number';
    const bothArePartOf = typeof currentEntityPartOf === 'string' && currentEntityPartOf === incomingPartOf;

    // For activities in the same creative work part, position is primary sort key
    if (bothHavePosition && bothArePartOf) {
      return currentEntityPosition > incomingEntityPosition;
    }

    const currentLivestreamingMetadata = getActivityLivestreamingMetadata(activity);

    if (
      incomingLivestreamingMetadata &&
      currentLivestreamingMetadata &&
      incomingLivestreamingMetadata.sessionId === currentLivestreamingMetadata.sessionId
    ) {
      return currentLivestreamingMetadata.sequenceNumber > incomingLivestreamingMetadata.sequenceNumber;
    }

    const currentSequenceId = getSequenceIdOrDeriveFromTimestamp(activity, ponyfill);

    if (typeof incomingSequenceId === 'number') {
      if (typeof currentSequenceId === 'number') {
        return currentSequenceId > incomingSequenceId;
      }

      // Always insert activity whose has sequence ID before those whose doesn't have sequence ID.
      return true;
    } else if (typeof currentSequenceId === 'number') {
      return false;
    }

    // No more properties can be used to find a good insertion spot.
    // Return `false` so the activity will append to the end.
    return false;
  });

  if (!~indexToInsert) {
    // If no right place can be found, append it.
    indexToInsert = nextActivities.length;
  }

  const prevActivity: WebChatActivity = indexToInsert === 0 ? undefined : nextActivities.at(indexToInsert - 1);
  const nextActivity: WebChatActivity = nextActivities.at(indexToInsert);
  let incomingPosition: number;

  if (prevActivity) {
    const prevPosition = prevActivity.channelData['webchat:internal:position'];

    if (nextActivity) {
      const nextSequenceId = nextActivity.channelData['webchat:internal:position'];

      // eslint-disable-next-line no-magic-numbers
      incomingPosition = (prevPosition + nextSequenceId) / 2;
    } else {
      incomingPosition = prevPosition + 1;
    }
  } else if (nextActivity) {
    const nextSequenceId = nextActivity.channelData['webchat:internal:position'];

    incomingPosition = nextSequenceId - 1;
  } else {
    incomingPosition = 1;
  }

  incomingActivity = updateIn(incomingActivity, ['channelData', 'webchat:internal:position'], () => incomingPosition);

  nextActivities.splice(indexToInsert, 0, incomingActivity);

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

          activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => v4());
          // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
          // Please refer to #4362 for details. Remove on or after 2024-07-31.
          activity = updateIn(activity, ['channelData', 'state'], () => SENDING);
          activity = updateIn(activity, ['channelData', 'webchat:send-status'], () => SENDING);

          // Assume the message was sent immediately after the very last message.
          // This helps to maintain the order of the outgoing message before the server respond.
          activity = updateIn(activity, ['channelData', 'webchat:sequence-id'], () => {
            const lastActivity = state.at(-1);

            if (!lastActivity) {
              return 1;
            }

            const lastSequenceId = lastActivity.channelData['webchat:sequence-id'];

            if (typeof lastSequenceId === 'number') {
              return lastSequenceId + 1;
            }

            const lastTimestampInNumber = +new ponyfill.Date(lastActivity.timestamp);

            if (!isNaN(lastTimestampInNumber)) {
              return lastTimestampInNumber + 1;
            }

            return +new ponyfill.Date();
          });

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
        {
          const existingActivity = state.find(findByClientActivityID(action.meta.clientActivityID));

          if (!existingActivity) {
            throw new Error(
              'botframework-webchat-internal: On POST_ACTIVITY_FULFILLED, there is no activities with same client activity ID'
            );
          }

          const updateOldSendStatusToSent: ComposeFn<WebChatActivity> = activity =>
            updateIn(
              activity,
              // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
              // Please refer to #4362 for details. Remove on or after 2024-07-31.
              ['channelData', 'state'],
              () => SENT
            );

          const updateNewSendStatusToSent: ComposeFn<WebChatActivity> = activity =>
            updateIn(activity, ['channelData', 'webchat:send-status'], () => SENT);

          const updatePermanentId: ComposeFn<WebChatActivity> = activity =>
            updateIn(
              activity,
              ['channelData', 'webchat:internal:id'],
              () => existingActivity.channelData['webchat:internal:id']
            );

          // Keep existing position.
          const updatePosition: ComposeFn<WebChatActivity> = activity =>
            updateIn(
              activity,
              ['channelData', 'webchat:internal:position'],
              () => existingActivity.channelData['webchat:internal:position']
            );

          // We will replace the activity with the version from the server
          const activity = compose<WebChatActivity>(
            updateOldSendStatusToSent,
            updateNewSendStatusToSent,
            updatePermanentId,
            updatePosition
          )(patchActivity(action.payload.activity, ponyfill));

          state = updateIn(state, [findByClientActivityID(action.meta.clientActivityID)], () => activity);
        }

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

            const existingActivity = state.find(({ id }) => id === activity.id);

            if (existingActivity) {
              activity = updateIn(
                activity,
                ['channelData', 'webchat:internal:id'],
                () => existingActivity.channelData['webchat:internal:id']
              );
            } else {
              activity = updateIn(activity, ['channelData', 'webchat:internal:id'], () => v4());
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
